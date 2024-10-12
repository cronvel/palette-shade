#!/usr/bin/env node

"use strict" ;

const fs = require( 'fs' ) ;
const chromajs = require( '../extlib/chromajs.custom.js' ) ;

const arrayToBase64 = array => Buffer.from( array.flat() ).toString( 'base64' ) ;



// Gray's L is 50, we start searching around there,
// but since chroma is better supported with slightly lighter value...
const CHROMA_AVG_L = 65 ;

// Get maximum chroma for a hue, return an array with that chroma, along with a L where it was found
function getMaxChromaForHue( hue ) {
	let lastFoundL ;

	for ( let c = 0 ; c < 140 ; c ++ ) {
		let found = false ;
		
		// We search from a central point to avoid unneccessary computing
		for ( let delta = 0 ; delta < 40 ; delta ++ ) {
			let chromaColor = chromajs( CHROMA_AVG_L + delta , c , hue , 'lch' ) ;
			if ( ! chromaColor._rgb._clipped ) { found = true ; lastFoundL = CHROMA_AVG_L + delta ; break ; }

			if ( delta ) {
				chromaColor = chromajs( CHROMA_AVG_L - delta , c , hue , 'lch' ) ;
				if ( ! chromaColor._rgb._clipped ) { found = true ; lastFoundL = CHROMA_AVG_L - delta ; break ; }
			}
		}

		if ( ! found ) {
			//console.log( "Hue:" , hue , "max chroma:" , c - 1 , "found lightness:" , lastFoundL ) ;
			return [ c - 1 , lastFoundL ] ;
		}
	}
	
	// Max chroma is around 131, it should never go here
	return null ;
}



// Get minimum and maximum ligthness for a given hue + chroma
function getMinMaxLightnessForHueAndChroma( hue , chroma , startingL ) {
	// We search from a central point to avoid unneccessary computing
	let chromaColor ,
		foundL = -1 ;

	for ( let delta = 0 ; delta < 40 ; delta ++ ) {
		chromaColor = chromajs( startingL + delta , chroma , hue , 'lch' ) ;
		if ( ! chromaColor._rgb._clipped ) { foundL = startingL + delta ; break ; }

		if ( delta ) {
			chromaColor = chromajs( startingL - delta , chroma , hue , 'lch' ) ;
			if ( ! chromaColor._rgb._clipped ) { foundL = startingL - delta ; break ; }
		}
	}
	
	var minL = 0 , maxL = 105 ;
	
	if ( foundL > startingL ) {
		minL = foundL ;
	}
	else {
		for ( let l = foundL ; l >= 0 ; l -- ) {
			chromaColor = chromajs( l , chroma , hue , 'lch' ) ;
			if ( chromaColor._rgb._clipped ) {
				minL = l + 1 ;
				break ;
			}
		}
	}
	
	if ( foundL < startingL ) {
		maxL = foundL ;
	}
	else {
		for ( let l = foundL ; l <= 105 ; l ++ ) {
			chromaColor = chromajs( l , chroma , hue , 'lch' ) ;
			if ( chromaColor._rgb._clipped ) {
				maxL = l - 1 ;
				break ;
			}
		}
	}
	
	return [ minL , maxL ] ;
}



// Get maximum chroma for a given hue + lightness
function getMaxChromaForHueAndLightness( hue , lightness ) {
	for ( let c = 1 ; c <= 140 ; c ++ ) {
		let chromaColor = chromajs( lightness , c , hue , 'lch' ) ;
		if ( chromaColor._rgb._clipped ) {
			return c - 1 ;
		}
	}

	return 140 ;
}



const info = {
	lowestMaxChroma: Infinity ,
	hueAtLowestMaxChroma: -1 ,
	highestMaxChroma: - Infinity ,
	hueAtHighestMaxChroma: -1 ,
	//lowestMinLightness: Infinity ,
	//hueChromaAtLowestMinLightness: -1 ,
	highestMinLightness: - Infinity ,
	hueChromaAtHighestMinLightness: -1 ,
	lowestMaxLightness: Infinity ,
	hueChromaAtLowestMaxLightness: -1 ,
	//highestMaxLightness: - Infinity ,
	//hueChromaAtHighestMaxLightness: -1
} ;

const hueMaxChroma = [] ;
const hueChromaMinLightness = [] ;
const hueChromaMaxLightness = [] ;
const hueLightnessMaxChroma = [] ;

for ( let h = 0 ; h < 360 ; h ++ ) {
	let [ maxC , foundL ] = getMaxChromaForHue( h ) ;
	hueMaxChroma[ h ] = maxC ;
	if ( maxC < info.lowestMaxChroma ) { info.lowestMaxChroma = maxC ; info.hueAtLowestMaxChroma = h ; }
	if ( maxC > info.highestMaxChroma ) { info.highestMaxChroma = maxC ; info.hueAtHighestMaxChroma = h ; }

	hueChromaMinLightness[ h ] = [] ;
	hueChromaMaxLightness[ h ] = [] ;
	hueLightnessMaxChroma[ h ] = [] ;

	for ( let c = 0 ; c <= maxC ; c ++ ) {
		let [ minL , maxL ] = getMinMaxLightnessForHueAndChroma( h , c , foundL ) ;
		hueChromaMinLightness[ h ][ c ] = minL ;
		hueChromaMaxLightness[ h ][ c ] = maxL ;
		//if ( minL < info.lowestMinLightness ) { info.lowestMinLightness = minL ; info.hueChromaAtLowestMinLightness = [ h , c ] ; }
		if ( minL > info.highestMinLightness ) { info.highestMinLightness = minL ; info.hueChromaAtHighestMinLightness = [ h , c ] ; }
		if ( maxL < info.lowestMaxLightness ) { info.lowestMaxLightness = maxL ; info.hueChromaAtLowestMaxLightness = [ h , c ] ; }
		//if ( maxL > info.highestMaxLightness ) { info.highestMaxLightness = maxL ; info.hueChromaAtHighestMaxLightness = [ h , c ] ; }
	}

	for ( let l = 0 ; l <= 100 ; l ++ ) {
		let maxC2 = getMaxChromaForHueAndLightness( h , l ) ;
		hueLightnessMaxChroma[ h ][ l ] = maxC2 ;
	}
}

console.log( "Info:" , info ) ;

// Transform to buffer

arrayToBase64

const jsonData = {
	info ,
	//hueMaxChroma , hueChromaMinLightness , hueChromaMaxLightness , hueLightnessMaxChroma
	hueMaxChroma: arrayToBase64( hueMaxChroma ) ,
	hueChromaMinLightness: arrayToBase64( hueChromaMinLightness ) ,
	hueChromaMaxLightness: arrayToBase64( hueChromaMaxLightness ) ,
	hueLightnessMaxChroma: arrayToBase64( hueLightnessMaxChroma )
} ;

//const json = JSON.stringify( jsonData ) ;
const json = JSON.stringify( jsonData , null , '  ' ) ;

fs.writeFileSync( 'lch-lookup.json' , json ) ;



// Tests:
return ;



const getMaxChromaForHueAndLightness_ = ( hue , lightness ) => hueLightnessMaxChroma[ hue ][ lightness ] ;
const getMinLightnessForHueAndChroma_ = ( hue , chroma ) => hueChromaMinLightness[ hue ][ chroma ] ;
const getMaxLightnessForHueAndChroma_ = ( hue , chroma ) => hueChromaMaxLightness[ hue ][ chroma ] ;

let hue = 200 , chroma = 60 , lightness = 90 ;

console.log(
	"Hue:" , hue , " Lightness:" , lightness ,
	" --> max Chroma:" , getMaxChromaForHueAndLightness_( hue , lightness )
) ;

console.log(
	"Hue:" , hue , " Chroma:" , chroma ,
	" --> min/max Lightness:" , getMinLightnessForHueAndChroma_( hue , chroma ) ,
	"/" , getMaxLightnessForHueAndChroma_( hue , chroma )
) ;
