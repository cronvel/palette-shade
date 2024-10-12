#!/usr/bin/env node

"use strict" ;

const chromajs = require( '../extlib/chromajs.custom.js' ) ;



// Gray's L is 50, we start searching around there,
// but since chroma is better supported with slightly lighter value...
const MEDIUM_L = 54 ;

// Get maximum L for a given hue + chroma
function getMaxChromaForHue( hue ) {
	for ( let c = 0 ; c < 150 ; c ++ ) {
		let chromaColor = chromajs( MEDIUM_L , c , hue , 'lch' ) ;
		if ( chromaColor._rgb._clipped ) {
			return c - 1 ;
		}
	}
	
	return c ;
}



// Get maximum L for a given hue + chroma
function getMinMaxLightnessForHueAndChroma( hue , chroma ) {
	let chromaColor = chromajs( MEDIUM_L , chroma , hue , 'lch' ) ;
	if ( chromaColor._rgb._clipped ) { return null ; }	// <-- this chroma/saturation value is too big for this hue
	
	var minL = 0 , maxL = 250 ;
	
	for ( let l = MEDIUM_L ; l >= 0 ; l -- ) {
		chromaColor = chromajs( l , chroma , hue , 'lch' ) ;
		if ( chromaColor._rgb._clipped ) {
			minL = l + 1 ;
			break ;
		}
	}
	
	for ( let l = MEDIUM_L ; l < 250 ; l ++ ) {
		chromaColor = chromajs( l , chroma , hue , 'lch' ) ;
		if ( chromaColor._rgb._clipped ) {
			maxL = l - 1 ;
			break ;
		}
	}
	
	return [ minL , maxL ] ;
}



//console.log( "Max C: " , getMaxChromaForHue( 0 ) ) ;
//console.log( "Min max L: " , getMinMaxLightnessForHueAndChroma( 0 , 50 ) ) ;

for ( let h = 0 ; h < 360 ; h ++ ) {
	let maxC = getMaxChromaForHue( h ) ;
	let maxL = getMinMaxLightnessForHueAndChroma( h , maxC ) ;
	console.log( "Hue: " + h + " --> max chroma: " + maxC + " --> max light for max chroma: " + maxL ) ;
}

