////////////////////////////////////////////////////////////////////////////////
// Program Name: Code Divider
// File Name: codeDivider.js
// File Description: This is the main script file for running this program.
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
/*global FS:true, CDIVUTILS:true, PATH:true, CDIVSPLITTER:true*/
var FS = require('fs'),
    OS = require('os'),
    CDIVUTILS = require('./cdivUtils.js'),
    PATH = require('path'),
    CDIVSPLITTER = require('./cdivSplitter.js');

//Function Definitions

////////////////////////////////////////////////////////////////////////////////
// Function Title: processArgs
// Description: This function processes the arguments provided in the command
//     line.
// Parameters: None
// Returns: An object that contains the processed arguments.  See the variable
//     list in this function for details.
////////////////////////////////////////////////////////////////////////////////
function processArgs() {
    var agoodArgs = [
            '-help',  //Property name: 'bhelp'; Property val: bool
            '-pre',   //Property name: 'bpre' ; Property val: bool
            '-repo',  //Property name: 'srepo'; Property val: string
            '-dest',  //Property name: 'sdest'; Property val: string
            '-ign',   //Property name: 'aign' ; Property val: regex array
            '-ext',   //Property name: 'ext' ; Property val: string arrays
            '-enc',   //Property name: 'senc' ; Property val: string
            '-cst',   //Property name: 'scst' ; Property val: string
            '-sets',  //Property name: 'bsets'; Property val: bool
            '-args'], //Property name: 'bargs'; Property val: bool
        agoodEncVals = ['ascii', 'utf8', 'utf16le', 'ucs2'],
        sstate = '', //States: '' or a goodArg string
        bok = true, //Whether a lack of further args would indicate an error.
        oresult = //The resultant settings object
            {
                //Note: the -ext command results stored in agoodExtVals and
                //aextValLangs.
                bhelp: false,
                bpre: false,
                srepo: '',
                sdest: '',
                aign: [],
                agoodExtVals: ['.js'], //Should match with aextValLangs.
                aextValLangs: ['javascript'], //Should match w/ agoodExtVals.
                senc: 'utf8',
                scst: '',
                bsets: false,
                bargs: false
            },
        aargsGiven = [],
        i, sword;


    //Private Functions

    ////////////////////////////////////////////////////////////////////////////
    // Function Title: processInitialState
    // Description: Processes user inputs when processArgs is looking for the
    //     next user command.  Decides which command handler to hand the next
    //     user command to.
    // Parameters: None
    // Preconditions: processArgs must be looking for next user command at the
    //     statement following the last user command or command argument.
    // Returns: None
    ////////////////////////////////////////////////////////////////////////////
    function processInitialState() {
        if ('-' === sword.charAt(0) && -1 !==
                agoodArgs.indexOf(sword)) {
            sstate = sword;
            aargsGiven.push(sword);
            bok = false;
            i -= 1; //Reprocess the current statement in the next state.
        } else if (-1 !== aargsGiven.indexOf(sword &&
                ('-help' !== sword &&
                '-ign' !== sword &&
                '-ext' !== sword))) {
            throw 'Invalid Statement: ' + sword;
        }
    }
    // End Function processInitialState ////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // Function Title: processHelpState
    // Description: Processes the user command "-help" by setting the bhelp
    //     settings attribute to true.
    // Parameters: None
    // Preconditions: The index must be at the user command '-help' when first
    //     called.
    // Returns: None
    ////////////////////////////////////////////////////////////////////////////
    function processHelpState() {
        oresult.bhelp = true;
        bok = true;
        sstate = '';
    }
    // End Function processHelpState ///////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // Function Title: processPreState
    // Description: Processes the user command "-pre" by setting the bpre
    //     settings attribute to true.
    // Parameters: None
    // Preconditions: The index must be at the user command '-pre' when first
    //     called.
    // Returns: None
    ////////////////////////////////////////////////////////////////////////////
    function processPreState() {
        oresult.bpre = true;
        bok = true;
        sstate = '';
    }
    // End Function processPreState ////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // Function Title: processRepoState
    // Description: Processes the user command '-repo' by setting the srepo
    //     settings attribute to the argument following the command after
    //     validating the path.
    // Parameters: None
    // Preconditions: The index must be at the user command '-repo' when first
    //     called.
    // Returns: None
    ////////////////////////////////////////////////////////////////////////////
    function processRepoState() {
        //Error if arg value missing for -repo.  Error if folder path resolves
        //to root or is invalid.  Otherwise, store value and move on to the next
        //argument.
        if ('-repo' !== sword) {
            if (CDIVUTILS.validateFolderPath(sword)) {
                oresult.srepo = sword;
                bok = true;
                sstate = '';
            } else {
                throw 'Invalid value for command -repo.  Invalid statement: ' +
                    sword;
            }
        }
    }
    // End Function processRepoState ///////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // Function Title: processDestState
    // Description: Processes the user command '-dest' by setting the sdest
    //     settings attribute to the argument following the command after
    //     validating the path.
    // Parameters: None
    // Preconditions: The index must be at the user command '-dest' when first
    //     called.
    // Returns: None
    ////////////////////////////////////////////////////////////////////////////
    function processDestState() {
        //Error if arg value missing for -dest.  Error if folder path resolves
        //to root or is invalid.  Otherwise, store value and move on to next
        //argument.
        if ('-dest' !== sword) {
            if (CDIVUTILS.validateFolderPath(sword)) {
                oresult.sdest = sword;
                bok = true;
                sstate = '';
            } else {
                throw 'Invalid value for command -repo.  Invalid statement: ' +
                    sword;
            }
        }
    }
    // End Function processDestState ///////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // Function Title: processIgnState
    // Description: Processes the user command '-ign' by setting the aign
    //     settings attribute to an array consisting of regular expression
    //     objects generated from the arguments following the command.
    // Parameters: None
    // Preconditions: The index must be at the user command '-ign' when first
    //     called.
    // Returns: None
    ////////////////////////////////////////////////////////////////////////////
    function processIgnState() {
        //Error if current arg is not a value and no values encountered
        //yet for -ign.  Otherwise, store value or move on to next
        //argument.
        if ('-ign' === sword) {
            bok = false; //Make sure we get a value argument.
        } else if ('-' !== sword.charAt(0)) {
            oresult.aign.push(CDIVUTILS.createGlobRegex(sword));
            bok = true;
        } else if (oresult.aign.length > 0) {
            sstate = '';
            i -= 1; //Reprocess current stmt in next state at end of this stmt.
        } else {
            throw 'Invalid value for command -ign. Invalid Statement: ' +
                sword;
        }
    }
    // End Function processIgnState ////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // Function Title: processExtState
    // Description: Processes the user command "-ext" by appending user-defined
    //     extensions and their languages to the parallel agoodExtVals and
    //     aextValLangs string arrays from the arguments following the command.
    //     New aextValLangs entries are limited to languages that were already
    //     present in aextValLangs at program start.
    // Parameters: None
    // Preconditions: The index must be at the user command "-ext" when first
    //     called.
    // Returns: None
    ////////////////////////////////////////////////////////////////////////////
    function processExtState() {
        //Error if current arg is not a value and no values encountered
        //yet for -ext.  Otherwise, store values for the extensions.
        if ('-ext' !== sword) {
            if ('.' === sword.charAt(0) &&
                    oresult.agoodExtVals.length ===
                    oresult.aextValLangs.length) {

                oresult.agoodExtVals.unshift(sword);
                bok = false;
            } else if ('.' !== sword.charAt(0) &&
                    '-' !== sword.charAt(0) &&
                    oresult.agoodExtVals.length > oresult.aextValLangs.length) {
                oresult.aextValLangs.unshift(sword);
                bok = true;
            } else if ('-' === sword.charAt(0) &&
                    oresult.agoodExtVals.length > 0 &&
                    oresult.agoodExtVals.length ===
                    oresult.aextValLangs.length) {
                sstate = '';
                i -= 1; //Reprocess the current stmt in the next state.
            } else if (('-' === sword.charAt(0) &&
                    0 === oresult.agoodExtVals.length) ||
                    ('.' === sword.charAt(0) &&
                    oresult.agoodExtVals.length !==
                    oresult.aextValLangs.length) ||
                    ('.' !== sword.charAt(0) &&
                    oresult.agoodExtVals.length ===
                    sword.charAt(0)) ||
                    oresult.agoodExtVals.length < oresult.aextValLangs.length) {
                throw 'Invalid value for command -ext: ' + sword;
            }
        }
    }
    // End Function processExtState ////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // Function Title: processEncState
    // Description: Processes the user command '-dest' by setting the sdest
    //     settings attribute to the argument following the command, after
    //     validating the input.
    // Parameters: None
    // Preconditions: The index must be at the user command '-enc' when first
    //     called.
    // Returns: None
    ////////////////////////////////////////////////////////////////////////////
    function processEncState() {
        //Error if arg value missing for -enc.  Error if invalid encoding.
        //Otherwise, store value and move on to the next argument.
        if ('-enc' !== sword) {
            if (-1 !== agoodEncVals.indexOf(sword)) {
                oresult.senc = sword;
                bok = true;
                sstate = '';
            } else {
                throw 'Invalid value for command -enc.  Invalid statement: ' +
                    sword;
            }
        }
    }
    // End Function processEncState ////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // Function Title: processCstState
    // Description: Processes the user command '-cst' by setting the scst
    //     settings attribute to the argument following the command.
    // Parameters: None
    // Preconditions: The index must be at the user command '-cst' when first
    //     called.
    // Returns: None
    ////////////////////////////////////////////////////////////////////////////
    function processCstState() {
        //Error if arg value missing for -cst.
        //Otherwise, store value and move on to the next argument.
        if ('-cst' !== sword){
            if ('-' !== sword.charAt(0)) {
                oresult.scst = sword;
                bok = true;
                sstate = '';
            } else {
                throw 'Invalid value for command -cst: ' + sword;
            }
        }
    }
    // End Function processCstState ////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // Function Title: processSetsState
    // Description: This function sets the 'bsets' oresult value to true.
    // Parameters: None
    // Preconditions: The index must be at the user command -sets when first
    //     called.
    // Returns: None
    ////////////////////////////////////////////////////////////////////////////
    function processSetsState() {
        oresult.bsets = true;
        bok = true;
        sstate = '';
    }
    // End Function processSetsState ///////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // Function Title: processArgsState
    // Description: This function sets the bargs oresult value to true.
    // Parameters: None
    // Preconditions: The index must be at the user command -args when first
    //     called.
    // Returns: None
    ////////////////////////////////////////////////////////////////////////////
    function processArgsState() {
        oresult.bargs = true;
        bok = true;
        sstate = '';
    }
    // End Function processArgsState ///////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // Function Title: validateArgs
    // Description: Checks that the set of args provided makes sense.
    // Parameters: None
    // Preconditions: The args must have already been loaded.
    // Returns: True if args are valid, otherwise throws an exception.
    ////////////////////////////////////////////////////////////////////////////
    function validateArgs() {
        //No arguments or any argument set including the help argument are both
        //automatically valid.
        //If -pre, -dest, -ign, -ext, -enc, or -cst were provided, -repo
        //must also have been provided.
        //The presence of -sets and -args is always optional.

        //Allow no arguments or any set with a -help argument.
        if (0 === aargsGiven.length || -1 !== aargsGiven.indexOf('-help')) {
            return;
        }

        //Otherwise, require the -repo command if -pre, -dest, -ign, -ext,
        //-enc, or -cst were provided.
        if ((-1 !== aargsGiven.indexOf('-pre') ||
                -1 !== aargsGiven.indexOf('-dest') ||
                -1 !== aargsGiven.indexOf('-ign') ||
                -1 !== aargsGiven.indexOf('-ext') ||
                -1 !== aargsGiven.indexOf('-enc') ||
                -1 !== aargsGiven.indexOf('-cst')) &&
                -1 === aargsGiven.indexOf('-repo')) {
            throw 'Invalid argument set.  Must use -repo if using any other ' +
                'command except -help, -sets, or -args.';
        }
    }
    // End Function ValidateArgs ///////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // Function Title: makeArgChanges
    // Description: Makes necessary changes to srepo, sdest, and aign arguments
    //     to help ensure safety.
    // Parameters: None
    // Preconditions: The args must have already been loaded.
    // Returns: None
    ////////////////////////////////////////////////////////////////////////////
    function makeArgChanges() {
        //Only do the alterations if the arguments indicate a real or preview
        //run of the program will be executed.
        validateArgs();
        if (-1 !== aargsGiven.indexOf('-repo')) {
            oresult.srepo = PATH.normalize(oresult.srepo);
            if ('' === oresult.sdest) {
                oresult.sdest = oresult.srepo;
            } else {
                oresult.sdest = PATH.normalize(oresult.sdest);
            }
            oresult.sdest = oresult.sdest + PATH.sep +
                oresult.srepo.split(PATH.sep).pop() + '_cDivFiles';
            oresult.aign.push(CDIVUTILS.createGlobRegex(oresult.sdest + '*'));
        }
    }
    // End Function makeArgChanges /////////////////////////////////////////////

    //Function Execution.

    //Load settings.  Skip initial system args.
    for (i = 2; i < process.argv.length; i += 1) {
        sword = process.argv[i];
        switch (sstate) {
        //State: Load command.
        case '':
            processInitialState();
            break;
        //State: Process the '-help' command.
        case '-help':
            processHelpState();
            break;
        //State: Process the '-pre' command.
        case '-pre':
            processPreState();
            break;
        //State: Load the argument for the '-repo' command.
        case '-repo':
            processRepoState();
            break;
        //State: Load the argument for the '-dest' command.
        case '-dest':
            processDestState();
            break;
        //State: Load the arguments for the '-ign' command.
        case '-ign':
            processIgnState();
            break;
        //State: Load the extension arguments for the '-ext' command.
        case '-ext':
            processExtState();
            break;
        case '-enc':
            processEncState();
            break;
        case '-cst':
            processCstState();
            break;
        case '-sets':
            processSetsState();
            break;
        case '-args':
            processArgsState();
            break;
        default:
            throw 'Bug 0001: A valid command lacks the code to process ' +
                'it.  Please contact the developer.  Command: ' +
                sword;
        }
    }

    //Detect missing argument value for last argument.
    if (!bok) {
        throw 'Missing value for command: ' +
            process.argv[process.argv.length - 1];
    }

    makeArgChanges();

    return oresult;
}
// End Function processArgs ////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Function Title: main
// Description: This function runs the program.
// Parameters: None
// Returns: None
////////////////////////////////////////////////////////////////////////////////
function main() {
    var osettings = processArgs(); //Hashtable of settings values

    //Private functions

    ////////////////////////////////////////////////////////////////////////////
    // Function Title: printCommandReference
    // Description: This function prints the command reference.
    // Parameters: None
    // Preconditions: documentation.txt must exist within the same folder as
    //     codeDivider.js.  The command reference must begin with
    //     'COMMAND REFERENCE' and end with a line of at least 8 forward
    //     slashes.
    // Returns: None
    ////////////////////////////////////////////////////////////////////////////
    function printCommandReference() {
        var spathToDocumentation = process.argv[1].split(PATH.sep),
            scommands = '',
            i;

        spathToDocumentation.pop();
        spathToDocumentation.push(PATH.sep + 'documentation.txt');
        scommands = FS.readFileSync(spathToDocumentation.join(PATH.sep),
            {'encoding': 'utf8'});
        i = scommands.search('COMMAND REFERENCE');
        scommands = scommands.substring(i, scommands.search('////////', i));
        console.log(scommands);
    }
    // End Function printCommandReference //////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // Function Title: printHelp
    // Description: This function prints the entirety of documentation.txt
    // Parameters: None
    // Preconditions: documentation.txt must exist within the same folder as
    //     codeDivder.js
    // Returns: None
    ////////////////////////////////////////////////////////////////////////////
    function printHelp() {
        var spathToDocumentation = process.argv[1].split(PATH.sep), shelp;

        spathToDocumentation.pop();
        spathToDocumentation.push(PATH.sep + 'documentation.txt');
        shelp = FS.readFileSync(spathToDocumentation.join(PATH.sep),
            {'encoding': 'utf8'});
        console.log(shelp);
    }
    // End Function printHelp //////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // Function Title: printSettings
    // Description: This function prints the internal settings object using its
    //     toString method.
    // Parameters: None
    // Preconditions: The settings object must be provided with a toString
    //     function.
    // Returns: None
    ////////////////////////////////////////////////////////////////////////////
    function printSettings() {
        var soutput = '', i;
        soutput += 'bhelp: ' + osettings.bhelp + '\n' +
            'bpre: ' + osettings.bpre + '\n' +
            'srepo: ' + osettings.srepo + '\n' +
            'sdest: ' + osettings.sdest + '\n' +
            'aign:\n';
        for (i = 0; i < osettings.aign.length; i += 1) {
            soutput += '    ' + i + ': ' + osettings.aign[i] + '\n';
        }
        soutput += 'agoodExtVals:\n';
        for (i = 0; i < osettings.agoodExtVals.length; i += 1) {
            soutput += '    ' + i + ': ' + osettings.agoodExtVals[i] + '\n';
        }
        soutput += 'aextValLangs:\n';
        for (i = 0; i < osettings.aextValLangs.length; i += 1) {
            soutput += '    ' + i + ': ' + osettings.aextValLangs[i] + '\n';
        }
        soutput += 'senc: ' + osettings.senc + '\n' +
            'scst: ' + osettings.scst + '\n' +
            'bsets: ' + osettings.bsets + '\n' +
            'bargs: ' + osettings.bargs;
        console.log(OS.eol + 'Internal program settings object:');
        console.log(soutput);
    }
    // End Function printSettings //////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////
    // Function Title: printArguments
    // Description: This function prints the arguments provided to this program.
    // Parameters: None
    // Returns: None
    ////////////////////////////////////////////////////////////////////////////
    function printArguments() {
        var i;
        console.log(OS.eol + 'Commands provided to function:');
        for (i = 0; i < process.argv.length; i += 1) {
            console.log(i + ': ' + process.argv[i]);
        }
    }
    // End Function printArguments /////////////////////////////////////////////

    //Function Execution

    console.log(OS.eol);
    
    if (osettings.bargs) {
        printArguments();
    }

    if (osettings.bsets) {
        printSettings();
    }

    if ('' === osettings.srepo && !osettings.bhelp && !osettings.bsets &&
            !osettings.bargs) {
        printCommandReference();
    } else if (osettings.bhelp) {
        printHelp();
    } else {
        CDIVSPLITTER.divideCode(osettings, osettings.srepo, osettings.sdest);
    }
}
// End Function main ///////////////////////////////////////////////////////////


//Program Execution
try {
    main();
} catch (err) {
    if ('object' === typeof err) {
        console.log(err.stack);
    } else {
        console.log('Error: ' + err);
    }
    process.exit(1);
}