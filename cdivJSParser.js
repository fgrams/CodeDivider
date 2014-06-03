////////////////////////////////////////////////////////////////////////////////
// Program Name: Code Divider
// File Name: cdivJSParser.js
// File Description: This module provides a function for finding the next
//     subdivision in a Javascript file.  Using modules like this will allow for
//     cdivSplitter to be language-agnostic with respect to the code files that
//     it processes.
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

//Note: This module assumes that the Javascript file provided is syntactically
//valid.  Results may be unpredictable, though not catastrophically so, if
//the file provided is not syntactically valid.  This module assumes the
//syntactic conventions of placing the name of the function, the
//starting left curly bracket, and (for module exports) the equals sign and
//left-hand operand for the assignment of the function on the same line as the
//function keyword.  This module also assumes that header and footer comments
//outside of a function definition are vertically adjacent to the function
//definition.

/*jslint node: true*/
"use strict";

//Public Functions

//This should return an array matching the arguments for CodeSection.substring.
module.exports.findNextJSCodeSection = function (sCode) {
    var i, nfunctionStart = 0, nfunctionLength = sCode.length, sword = '',
        sname, sstartBracket, sendBracket, nbrackets = 0, nbraces = 0,
        nstate = 0, apreviousStates = [], schar, squoteMark, bfoundEnd = false,
        aresult;

//TEST CODE
console.log('In findNextJSCodeSection.');

    //Presumes no comments or quotes on function line.
    function getFunctionName() {
        var j, ssubChar, ssubWord = '', nsubState = 0,
            bfoundName = false, sfunctionName;

        for (j = i; j > 0 && !bfoundName; j -= 1) {
            ssubChar = sCode.charAt(j);

            //Including periods in "word" for this function.
            if (/[\w\.]/.test(ssubChar)) {
                ssubWord = ssubChar + ssubWord;
            } else {
                sfunctionName = ssubWord;
                ssubWord = '';
            }

            switch (nsubState) {
            //State: AFTER_FUNCTION_KEYWORD
            case 0:
                if ('(' === ssubChar) {
                    sfunctionName = '';
                } else if ('function' === ssubWord) {
                    if (/[\W]/.test(sCode.charAt(j - 1))) {
                        if ('' !== sfunctionName) {
                            bfoundName = true;
                        }

                        nsubState = 1; //BEFORE_FUNCTION_KEYWORD
                    }
                }
                break;
            //State: BEFORE_FUNCTION_KEYWORD
            case 1:
                if ('=' === ssubChar) {
                    sfunctionName = '';
                    nsubState = 2; //BEFORE_EQUALS_SIGN
                }
                break;
            //State: BEFORE_EQUALS_SIGN
            case 2:
                if ('' !== sfunctionName && /[^\w\.]/.test(ssubChar)) {
                    bfoundName = true;
                }
                break;
            default:
                throw 'Invalid internal state number, getFunctionName.';
            }

            //Whatever happens, stop upon finding the beginning of the line
            //after reaching the function keyword.
            if (0 !== nsubState) {
                if (/[\r\n]/.test(ssubChar)) {
                    break;
                }
            }
        }

        if (!bfoundName) {
            sfunctionName = false;
        }

        return sfunctionName;
    }
    // End Function getFunctionName ////////////////////////////////////////////

    function findLastLineEnd() {
        var j, ssubChar, bfoundEndLine = false;

        for (j = i; j > 0; j -= 1) {
            ssubChar = sCode.charAt(j);
            if (/[\r\n]/.test(ssubChar)) {
                bfoundEndLine = true;
            } else if (bfoundEndLine) {
                if (/[^\r\n]/.test(ssubChar)) {
                    break;
                }
            }
        }

        return j;
    }


    for (i = 0; i < sCode.length && false !== sname && !bfoundEnd; i += 1) {
        schar = sCode.charAt(i);

        if (/\w/.test(schar)) {
            sword += schar;
        } else {
            sword = '';
        }

        switch (nstate) {
        //State: NORMAL
        case 0:
            if ('/' === schar) {
                apreviousStates.unshift(nstate);
                nstate = 2; //To COMMENT_START
            } else if (/['"]/.test(schar)) {
                squoteMark = schar;
                apreviousStates.unshift(nstate);
                nstate = 6; //To IN_QUOTE
            } else if (/[\(\[]/.test(schar)) {
                if ('[' === schar) {
                    sstartBracket = '[';
                    sendBracket = ']';
                } else {
                    sstartBracket = '(';
                    sendBracket = ')';
                }
                nbrackets += 1;
                apreviousStates.unshift(nstate);
                nstate = 11; //To IN_BRACKETS
            } else if ('var' === sword) {
                apreviousStates.unshift(nstate);
                nstate = 12; //To IN_VAR_STATEMENT
            } else if ('function' === sword) {
                apreviousStates.unshift(nstate);
                nstate = 8; //To IN_FUNCTION_START
            } else if (/[\n\r]/.test(schar)) {
                nfunctionStart = i + 1;
            }
            break;
        //State: IN_FUNCTION
        case 1:
            if ('/' === schar) {
                apreviousStates.unshift(nstate);
                nstate = 2; //To COMMENT_START
            } else if (/['"]/.test(schar)) {
                squoteMark = schar;
                apreviousStates.unshift(nstate);
                nstate = 6; //To IN_QUOTE
            } else if (/[\(\[]/.test(schar)) {
                if ('[' === schar) {
                    sstartBracket = '[';
                    sendBracket = ']';
                } else {
                    sstartBracket = '(';
                    sendBracket = ')';
                }
                nbrackets += 1;
                apreviousStates.unshift(nstate);
                nstate = 11; //To IN_BRACKETS
            } else if ('var' === sword) {
                apreviousStates.unshift(nstate);
                nstate = 12; //To IN_VAR_STATEMENT
            } else if ('{' === schar) {
                nbraces += 1;
            } else if ('}' === schar) {
                nbraces -= 1;
                if (0 === nbraces) {
                    nstate = 10; //To AFTER_FUNCTION_END
                }
            }
            break;
        //State: COMMENT_START
        case 2:
            if ('/' === schar) {
                nstate = 3; //To IN_LINE_COMMENT
            } else if ('*' === schar) {
                nstate = 4; //To IN_BLOCK_COMMENT
            }
            break;
        //State: IN_LINE_COMMENT
        case 3:
            if (/[\n\r]/.test(schar)) {
                //This if statement is a hack to get detecting function header
                //comments to work right (due to two-character line breaks in
                //some systems):
                if (('\n' === sCode.charAt(i) &&
                        '\r' === sCode.charAt(i + 1)) ||
                        ('\r' === sCode.charAt(i) &&
                        '\n' === sCode.charAt(i + 1))) {
                    i += 1;
                }
                nstate = apreviousStates.shift();
            }
            break;
        //State: IN_BLOCK_COMMENT
        case 4:
            if ('*' === schar) {
                nstate = 5; //To IN_BLOCK_COMMENT_END
            }
            break;
        //State: IN_BLOCK_COMMENT_END
        case 5:
            if ('/' === schar) {
                nstate = apreviousStates.shift();
            } else {
                nstate = 4; //To IN_BLOCK_COMMENT
            }
            break;
        //State: IN_QUOTE
        case 6:
            if ('\\' === schar) {
                nstate = 7; //To IN_ESCAPE_SEQUENCE
            } else if (squoteMark === schar) {
                nstate = apreviousStates.shift();
            }
            break;
        //State: IN_ESCAPE_SEQUENCE
        case 7:
            nstate = 6; //To IN_QUOTE
            break;
        //State: IN_FUNCTION_START
        case 8:
            if (/\W/.test(schar)) {
                nstate = 9; //To IN_FUNCTION_DECLARATION
            } else {
                nstate = 0; //To NORMAL
            }
            break;
        //State: IN_FUNCTION_DECLARATION
        case 9:
            if ('{' === schar) {
                nbraces += 1;
                sname = getFunctionName();
                nstate = 1; //To IN_FUNCTION
            }
            break;
        //State: AFTER_FUNCTION_END
        case 10:
            if (/[\S]/.test(schar) && !/[\n\r]/.test(schar)) {
                nfunctionLength = findLastLineEnd() - nfunctionStart;
                bfoundEnd = true;
            } else if ('/' === schar) {
                apreviousStates.unshift(nstate);
                nstate = 2; //To COMMENT_START
            }
            break;
        //State: IN_BRACKETS
            //Note: Parens (round brackets if it makes you feel better)
            //or square brackets
        case 11:
            if ('/' === schar) {
                apreviousStates.unshift(nstate);
                nstate = 2; //To COMMENT_START
            } else if (/['"]/.test(schar)) {
                squoteMark = schar;
                apreviousStates.unshift(nstate);
                nstate = 6; //To IN_QUOTE
            } else if (sstartBracket === schar) {
                nbrackets += 1;
            } else if (sendBracket === schar) {
                nbrackets -= 1;
                if (0 === nbrackets) {
                    nstate = apreviousStates.shift();
                }
            } else if (/[\n\r]/.test(schar)) {
                nfunctionStart = i + 1;
            }
            break;
        //State: IN_VAR_STATEMENT
        case 12:
            if ('/' === schar) {
                apreviousStates.unshift(nstate);
                nstate = 2; //To COMMENT_START
            } else if (/['"]/.test(schar)) {
                squoteMark = schar;
                apreviousStates.unshift(nstate);
                nstate = 6; //To IN_QUOTE
            } else if (/[\(\[]/.test(schar)) {
                if ('[' === schar) {
                    sstartBracket = '[';
                    sendBracket = ']';
                } else {
                    sstartBracket = '(';
                    sendBracket = ')';
                }
                nbrackets += 1;
                apreviousStates.unshift(nstate);
                nstate = 11; //To IN_BRACKETS
            } else if (';' === schar) {
                nstate = apreviousStates.shift(nstate);
            }
            break;
        default:
            throw 'Bug 0005: Invalid state number in cdivJSParser.js: ' +
                nstate + '.  Please contact the developer.';
        }
    }

    if (false === sname || undefined === sname) {
        aresult = false;
    } else {
        aresult = [nfunctionStart, sname.replace(/\./g, "_"),
            sCode.substring(nfunctionStart, nfunctionStart + nfunctionLength)];
    }

    return aresult;
};