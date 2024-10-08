#!/usr/bin/env node

"use strict" ;

const lib = require( '..' ) ;
const Palette = lib.Palette ;
const Color = lib.Color ;



var palette = new Palette() ;
//console.log( "Palette:" , palette ) ;

var colorStr = 'light tint of yellow' ;
var colorObject = Color.parse( colorStr ) ;
console.log( "Color object: " , colorObject ) ;
console.log( "Color code: " , palette.getHex( colorObject ) ) ;
