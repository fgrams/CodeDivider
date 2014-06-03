////////////////////////////////////////////////////////////////////////////////
// Program Name: Code Divider
// File Name: cdivSplitter.js
// File Description: This module provides utilities related to file ops specific
//     to this program.
// Version: 0.1
// Release Date: TBD
//
// Copyright 2014, Frank Grams
//
// WARNING: THIS IS A NON-FUNCTIONAL DEVELOPMENT VERSION OF THE PROGRAM.
//
// Release Terms:
// 
// This file is part of Code Divider.
//
// Code Divider is free software: you may redistribute it and/or modify it
// under the terms of the GNU General Public License (GPL) as published by the
// Free Software Foundation, either version 3 of the License, or (at your
// option) any later version.
// 
// Code Divider is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
// FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for
// more details.
//
// You should have received a copy of the GNU General Public License along with
// this program.  If not, please view the license at 
// <http://www.gnu.org/licenses/>.
//
// Notes:
//
// See the file "documentation.txt" included with this program for usage
// instructions.  See "readme.txt" for detailed information about this release.
////////////////////////////////////////////////////////////////////////////////

/*jslint node: true*/
"use strict";
/*global FS:true, CDIVUTILS:true, PATH:true, ASYNC:true, CDIVPARSER:true*/
var FS = require('fs'),
    PATH = require('path'),
    ASYNC = require('async'),
    CDIVUTILS = require('./cdivUtils.js'),
    CDIVJSPARSER = require('./cdivJSParser.js');

//Callbacks.  jsLint says not to define functions in loops, and recursions are
//a sort of loop even though it doesn't detect this, so I'm putting the
//callbacks for recursive functions here.



//Public Functions

////////////////////////////////////////////////////////////////////////////////
// Function Title: findNextCodeSection
// Description: Finds the next section of code that should be put into a
//     separate file.  This is where the individual code parser modules will
//     be called from.
// Interface Required for Modules: Modules should take a single argument:
//     a string.  They should return an array matching the 
// Parameters:
//     aSection, array, 3 elements:
//         0) Number, the starting index of the section.
//         1) String, the name of the section.
//         2) String, the text of the section.
//     sLanguage, string, the language for selecting the parser.
// Preconditions: None
// Returns: An array having the same elements described in aSection above.  If
//     the function is given the empty array, it returns the empty array.
////////////////////////////////////////////////////////////////////////////////
function findNextCodeSection(sCode, sLanguage) {
    var aresult = [];

    //TEST CODE
    console.log('In findNextCodeSection.');

    if (sCode) {
        switch (sLanguage) {
        case 'javascript':
            aresult = CDIVJSPARSER.findNextJSCodeSection(sCode);
            break;
        default:
            console.log('Missing handler for supported programming language: ' +
                sLanguage + '.  Please contact the developer.  Continuing...');
            break;
        }
    }

    //TEST CODE
    var x;
    for (x = 0; x < aresult.length; x += 1) {
        console.log('findNextCodeSection result value ' + x + ':\n' +
            aresult[x]);
    }

    return aresult;
}
// End Function findNextCodeSection ////////////////////////////////////////////

function nukeFolder(oSettings, sWriteFolder) {
    var i, afiles, ostats, spath;

    //TEST CODE
    console.log('In nukeFolder.  Nuking: ' + sWriteFolder);

    if (!FS.existsSync(sWriteFolder)) {
        return;
    }

    if (CDIVUTILS.pathContainsDirectory(oSettings.sdest, sWriteFolder) &&
            CDIVUTILS.validateFolderPath(sWriteFolder)) {
        afiles = FS.readdirSync(sWriteFolder);

        for (i = 0; i < afiles.length; i += 1) {
            spath = sWriteFolder + PATH.sep + afiles[i];
            ostats = FS.statSync(spath);

            if (ostats.isFile()) {

                if (!oSettings.bpre) {
                    console.log('Deleting File: ' + spath);
                    //FS.unlinkSync(spath);
                } else {
                    console.log('(Not) Deleting File: ' + spath);
                }
            } else if (ostats.isDirectory()) {

                if (!oSettings.bpre) {
                    nukeFolder(oSettings, spath);
                    console.log('Deleting Folder: ' + spath);
                    //FS.rmdirSync(spath);
                } else {
                    nukeFolder(oSettings, spath);
                    console.log('(Not) Deleting Folder: ' + spath);
                }
            }
        }
    }
}

function writeFolderChain(oSettings, sWriteFolder) {
    var apathElements, spath;

    //TEST CODE
    console.log('In writeFolderChain.  Writing: ' + sWriteFolder);

    if (CDIVUTILS.validateFolderPath(sWriteFolder)) {

        if (!FS.existsSync(sWriteFolder)) {
            apathElements = sWriteFolder.split(PATH.sep);
            apathElements.pop();
            spath = apathElements.join(PATH.sep);
            writeFolderChain(spath);

            if (!oSettings.bpre) {
                console.log('Creating Folder: ' + sWriteFolder);
                //FS.mkdirSync(sWriteFolder);
            } else {
                console.log('(Not) Creating Folder: ' + sWriteFolder);
            }
        }
    }
}

function writeCodeFile(oSettings, sPath, sText) {
    var apathElements, sfolder;

    //TEST CODE
    console.log('In writeCodeFile.  Writing: ' + sPath);
    console.log('Text to write: ' + sText);

    if (CDIVUTILS.pathContainsDirectory(oSettings.sdest, sPath) &&
            CDIVUTILS.validateFilePath(sPath)) {

        if (!oSettings.bpre) {
            apathElements = sPath.split(PATH.sep);
            apathElements.pop();
            sfolder = apathElements.join(PATH.sep);
            writeFolderChain(sfolder);
            console.log('Writing File: ' + sPath);
            //FS.writeFile(sPath, sText, 
            //    {
            //        encoding: oSettings.senc
            //    }, function (oError) {
            //    if (oError) {
            //        throw oError;
            //    }
            //});
        } else {
            console.log('(Not) Writing File: ' + sPath);
        }
    }
}

module.exports.divideCode = function (oSettings, sSourceFolderPath,
    sDestFolderPath) {

    //TEST CODE
    console.log('In divideCode.  Source: ' + sSourceFolderPath + '  Destination: ' +
        sDestFolderPath);

    if (!CDIVUTILS.validateFolderPath(sSourceFolderPath) ||
            !CDIVUTILS.validateFolderPath(sDestFolderPath)) {
        throw 'cdivSplitter.js: One or more internally-generated ' +
            'input folder paths were invalid.  Source Path: ' +
            sSourceFolderPath + '  Destination Path: ' + sDestFolderPath;
    }

    FS.readdir(sSourceFolderPath, function (oError, aFiles) {

    //TEST CODE
    console.log('In FS.readdir callback.');

        if (oError) {
            throw oError;
        }

        if (oSettings.sdest === sDestFolderPath) {
            nukeFolder(oSettings, sDestFolderPath);
        }

        ASYNC.each(aFiles,
            function (sFileName, callback) {
                var i, sreadFilePath = sSourceFolderPath + PATH.sep + sFileName;

    //TEST CODE
    console.log('In ASYNC.each function.  File name: ' + sFileName);

                for (i = 0; i < oSettings.aign.length; i += 1) {
                    if (oSettings.aign[i].test(sreadFilePath)) {
                        callback();
                        return;
                    }
                }

                FS.stat(sreadFilePath, function (oError, oStats) {
                    var sextension, nlanguageIndex, slanguage;

    //TEST CODE
    console.log('In FS.stat callback.');

                    if (oError) {
                        throw oError;
                    }

                    if (oStats.isFile()) {

    //TEST CODE
    console.log('In isFile portion of FS.stat callback.');
                        sextension = /\.[^\.]+/.exec(sFileName)[0];
                        nlanguageIndex = oSettings.agoodExtVals.
                            indexOf(sextension);

    //TEST CODE
    console.log('Index of extension ' + sextension + ': ' + nlanguageIndex);

    //TEST CODE
    var x;
    for (x = 0; x < oSettings.agoodExtVals.length; x += 1) {
        console.log('' + x + ': ' + oSettings.agoodExtVals[x] + ', ' +
            oSettings.aextValLangs[x]);
    }

                        if (-1 === nlanguageIndex) {
                            //TEST CODE.
                            console.log('Returning early.  File Name: ' +
                                sFileName + ' Extension: ' + sextension);
                            return;
                        }

                        slanguage = oSettings.aextValLangs[nlanguageIndex];

                        FS.readFile(sreadFilePath, 
                            {
                                encoding: oSettings.senc
                            },
                            function generateCodeFiles(oError, sText,
                                sWriteFolderPath) {
                                var ssubSection, swriteFilePath, asubSection;

    //TEST CODE
    console.log('In readFile callback generateCodeFiles.');

                                if (oError) {
                                    throw oError;
                                }

                                if (!sWriteFolderPath) {
                                    sWriteFolderPath = sDestFolderPath +
                                        PATH.sep +
                                        /^[^\.]+(?=\.[^\.]+$)/.exec(sFileName);
                                }

    //TEST CODE
    console.log('generateCodeFiles sWriteFolderPath: ' + sWriteFolderPath);

                                ssubSection = sText;

                                while (ssubSection) {
                                    asubSection = findNextCodeSection(
                                        ssubSection,
                                        slanguage
                                    );

                                    if (3 === asubSection.length) {
                                        swriteFilePath = sWriteFolderPath +
                                            PATH.sep + asubSection[1] +
                                            sextension;
                                        writeCodeFile(oSettings, swriteFilePath,
                                            asubSection[2]);
                                        generateCodeFiles(null,
                                            /\{[\S\s]*\}(?=[^\}]*$)/.exec(
                                                asubSection[2]
                                            )[0],
                                            sWriteFolderPath + PATH.sep +
                                            asubSection[1]);

                                        ssubSection = ssubSection.substring(
                                            asubSection[0] +
                                                asubSection[2].length
                                        );
                                    } else {
                                        ssubSection = '';
                                    }
                                }
                            });
                    } else if (oStats.isDirectory()) {

    //TEST CODE
    console.log('In isDirectory portion of Stats callback.');
                        module.exports.divideCode(oSettings,
                            sSourceFolderPath + PATH.sep + sFileName,
                            sDestFolderPath + PATH.sep + sFileName);
                    }
                });

                callback();
            }, function (oError) {
                if (oError) {
                    throw oError;
                }
            });

    });
};