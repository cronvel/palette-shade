#!/usr/bin/env node

"use strict" ;

const lib = require( '..' ) ;
const Palette = lib.Palette ;
const Color = lib.Color ;

var colorStr = process.argv.length > 2 ? process.argv.slice( 2 ).join( ' ' ) : 'dark shade of red' ;


var palette = new Palette( {
	shadeColor: '#305'
} ) ;
//console.log( "Palette:" , palette ) ;

var colorObject = Color.parse( colorStr ) ;
//console.log( "Color object: " , colorObject ) ;
console.log( "Color code for '" + colorStr + "':" , palette.getHex( colorObject ) ) ;

