////////////////////////////////////////////////////////////////////////////////
// Program Name: Code Divider
// File Name: cdivUtils.js
// File Description: This file contains utility functions used in Code Divider.
// Version: 0.1
// Release Date: TBD
// Last Edited: Frank Grams, May 13, 2014
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
/*global OS: true, PATH:true*/

var OS = require('os'),
    PATH = require('path');


//Public Functions

////////////////////////////////////////////////////////////////////////////////
// Function Title: isPath
// Description: This function checks whether a string is a Windows or
//     Unix file system path.
// Parameters: sPath, string, the path to be checked
// Returns: Boolean, true if the string is a file system path, false otherwise.
////////////////////////////////////////////////////////////////////////////////
function isPath(sPath) {
    var bresult = false;

    //Validate inputs.
    if ('string' !== typeof sPath || '' === sPath) {
        throw 'Invalid input type for cdivUtils - isPath, sPath: ' +
            typeof sPath + ' Value: ' + sPath;
    }

    if (/win/.test(OS.type()) && 'Darwin' !== OS.type()) {
        //Validate a path for the Windows environment.  Allow either a full path
        //or a relative path.  Allow a root path.
        if (/^(?:[a-zA-Z]:[\\\/]{1,2}|\.{1,2}[\\\/])(?:[\w\s_@\-]+[\\\/])*(?:[\w\s_@\-]+(?:[\\\/]|\.[\w\s_@\-]+)|[\w\s_@\-]*)$/i.
                test(sPath)) {
            bresult = true;
        }
    } else {
        //Validate a path for the Unix environment.  Allow either a full path or
        //a relative path.  Allow a root path.

        if (/^(?:\/|\.{1,2}\/)(?:[\w\s_@\-]+\/)*(?:[\w\s_@\-]+(?:\/|\.[\w\s_@\-]+)|[\w\s_@\-]*)$/i.
                test(sPath)) {
            bresult = true;
        }
    }

    return bresult;
}
// End Function validateFilePath ///////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Function Title: isRootPath
// Description: This function checks whether a string is a Windows or
//     Unix root directory path.
// Parameters: sPath, string, the path to be checked
// Preconditions: The input should have been checked previously with isPath().
// Returns: Boolean, true if the string is a root dir path, false otherwise.
////////////////////////////////////////////////////////////////////////////////
function isRootPath(sPath) {
    var bresult = false;

    //Validate inputs.
    if ('string' !== typeof sPath || '' === sPath) {
        throw 'Invalid input type for cdivUtils - isRootPath, sPath: ' +
            typeof sPath + ' Value: ' + sPath;
    }

    if (/win/.test(OS.type()) && 'Darwin' !== OS.type()) {
        //Determine if a valid path is a root path for the Windows environment.
        if (/^[a-zA-Z]:[\\\/]{1,2}$/i.test(sPath)) {
            bresult = true;
        }
    } else {
        //Determine if a valid path is a root path for the Unix environment.
        if ('/' === sPath) {
            bresult = true;
        }
    }

    return bresult;
}
// End Function isRootPath /////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Function Title: isFolderPath
// Description: This function checks whether a string is a Windows or
//     Unix folder path.  Paths to files without file extensions are considered
//     folder paths for this purpose.
// Parameters: sPath, string, the path to be checked
// Preconditions: The input should have been checked previously with isPath().
// Returns: Boolean, true if the string is a folder path, false otherwise.
////////////////////////////////////////////////////////////////////////////////
function isFolderPath(sPath) {
    var bresult = false;

    //Validate inputs.
    if ('string' !== typeof sPath || '' === sPath) {
        throw 'Invalid input type for cdivUtils - isFolderPath, sPath: ' +
            typeof sPath + ' Value: ' + sPath;
    }

    if (!/[\w\s_@\-]+\.[\w\s_@\-]+$/i.test(sPath)) {
        //Determine if a valid path is (syntactically) a folder path.
        bresult = true;
    }

    return bresult;
}
// End Function isFolderPath ///////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Function Title: isFilePath
// Description: This function checks whether a string is a Windows or
//     Unix file path.  Paths to files without file extensions are considered
//     folder paths for this purpose.
// Parameters: sPath, string, the path to be checked
// Preconditions: The input should have been checked previously with isPath().
// Returns: Boolean, true if the string is a file path, false otherwise.
////////////////////////////////////////////////////////////////////////////////
function isFilePath(sPath) {
    var bresult = false;

    //Validate inputs.
    if ('string' !== typeof sPath || '' === sPath) {
        throw 'Invalid input type for cdivUtils - isFilePath, sPath: ' +
            typeof sPath + ' Value: ' + sPath;
    }

    if (/[\w\s_@\-]+\.[\w\s_@\-]+$/i.test(sPath)) {
        //Determine if a valid path is (syntactically) a file path.
        bresult = true;
    }

    return bresult;
}
// End Function isFilePath /////////////////////////////////////////////////////


//Module Exports

module.exports.pathContainsDirectory = function (sParentDirectory, sPath) {
    var i, aparentPathItems = [], achildPathItems = [], bresult = false;

    if (module.exports.validatePath(sParentDirectory) &&
            module.exports.validatePath(sPath)) {
        aparentPathItems = sParentDirectory.split(PATH.sep);
        achildPathItems = sParentDirectory.split(PATH.sep);

        if (aparentPathItems.length <= achildPathItems.length &&
                aparentPathItems.length > 0) {
            for (i = 0; i < aparentPathItems.length; i += 1) {
                if (aparentPathItems[i] === achildPathItems[i]) {
                    bresult = true;
                } else {
                    bresult = false;
                    break;
                }
            }
        }
    }

    return bresult;
};

module.exports.validatePath = function (sPath) {
    var bresult = false;

    //Validate inputs.
    if ('string' !== typeof sPath || '' === sPath) {
        throw 'Invalid input type for cdivUtils.validateFolderPath, sPath: ' +
            typeof sPath + ' Value: ' + sPath;
    }

    //Disallow invalid paths and root paths.
    if (isPath(sPath) && !isRootPath(PATH.normalize(sPath))) {
        bresult = true;
    }

    return bresult;
};

////////////////////////////////////////////////////////////////////////////////
// Function Title: validateFolderPath
// Description: This function makes sure that a Windows or Unix path is
//     not an invalid path, a root path, or a file path.
// Parameters: sPath, string, the path to be validated
// Returns: Boolean, true if the path is a valid folder path, false otherwise.
////////////////////////////////////////////////////////////////////////////////
module.exports.validateFolderPath = function (sPath) {
    var bresult = false;

    //Validate inputs.
    if ('string' !== typeof sPath || '' === sPath) {
        throw 'Invalid input type for cdivUtils.validateFolderPath, sPath: ' +
            typeof sPath + ' Value: ' + sPath;
    }

    if (isPath(sPath) && isFolderPath(sPath)) {
        //Disallow relative paths that resolve to root paths.
        if (!isRootPath(PATH.normalize(sPath))) {
            bresult = true;
        }
    }

    return bresult;
};
// End Function validateFolderPath /////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Function Title: validateFilePath
// Description: This function makes sure that a Windows or Unix path is
//     not an invalid path, a root path, or a folder path.
// Parameters: sPath, string, the path to be validated
// Returns: Boolean, true if the path is a valid file path, false otherwise.
////////////////////////////////////////////////////////////////////////////////
module.exports.validateFilePath = function (sPath) {
    var bresult = false;

    //Validate inputs.
    if ('string' !== typeof sPath || '' === sPath) {
        throw 'Invalid input type for cdivUtils.validateFilePath, sPath: ' +
            typeof sPath + ' Value: ' + sPath;
    }

    if (isPath(sPath) && isFilePath(sPath) && !isRootPath(sPath)) {
        //Disallow relative paths that resolve to root paths.
        if (!isRootPath(PATH.normalize(sPath))) {
            bresult = true;
        }
    }

    return bresult;
};
// End Function validateFilePath ///////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Function Title: createGlobRegex
// Description: This function creates a regular expression object from an input
//     string.  All characters are made to be searched for literally except for
//     ? and *.  An unescaped - character at the beginning produces an error,
//     and ? is converted to a ".".  After the first character, "-" is left
//     alone if it occurs.  This function cannot make a regex to search for a
//     literal ? or *.  The search is case-sensitive.
// Parameters: sPattern, string, the string to be converted to a regex.
// Returns: A regex object created from the input string.
////////////////////////////////////////////////////////////////////////////////
module.exports.createGlobRegex = function (sPattern) {
    var oresult, snewPattern;

    //Validate inputs.
    if ('string' !== typeof sPattern || '' === sPattern) {
        throw 'Invalid input type for cdivUtils - createGrepRegex, sPattern: ' +
            typeof sPattern + ' Value: ' + sPattern;
    }

    if ('-' === sPattern.charAt(0)) {
        throw 'cdivUtils - createGrepRegex: Input pattern should not start ' +
            'with a "-" character.  Invalid statement: ' + sPattern;
    }

    snewPattern = sPattern.replace(/^\\-/, "-");
    snewPattern = sPattern.replace(/([\.\+\^\=\!\:\$\{\}\(\)\|\[\]\/\\])/g,
        "\\$1");
    snewPattern = sPattern.replace(/\?/g, ".");
    snewPattern = sPattern.replace(/\*/g, ".*");
    oresult = new RegExp("/^" + snewPattern + "$/");

    return oresult;
};
// End Function createGlobRegex ////////////////////////////////////////////////