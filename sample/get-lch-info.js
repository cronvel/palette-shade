#!/usr/bin/env node

"use strict" ;

const lookupTable = require( './lch-lookup.json' ) ;
const base64ToArray = str => Buffer.from( str , 'base64' ) ;



function reconstructTables() {
	lookupTable.hueMaxChroma = base64ToArray( lookupTable.hueMaxChroma ) ;

	var flatHueChromaMinLightness = base64ToArray( lookupTable.hueChromaMinLightness ) ;
	var flatHueChromaMaxLightness = base64ToArray( lookupTable.hueChromaMaxLightness ) ;
	var flatHueLightnessMaxChroma = base64ToArray( lookupTable.hueLightnessMaxChroma ) ;

	lookupTable.hueChromaMinLightness = [] ;
	lookupTable.hueChromaMaxLightness = [] ;
	lookupTable.hueLightnessMaxChroma = [] ;

	for ( let h = 0 , lightnessIndex = 0 , chromaIndex = 0 ; h < 360 ; h ++ ) {
		lookupTable.hueChromaMinLightness[ h ] = [] ;
		lookupTable.hueChromaMaxLightness[ h ] = [] ;
		lookupTable.hueLightnessMaxChroma[ h ] = [] ;

		for ( let c = 0 ; c <= lookupTable.hueMaxChroma[ h ] ; c ++ , lightnessIndex ++ ) {
			lookupTable.hueChromaMinLightness[ h ][ c ] = flatHueChromaMinLightness[ lightnessIndex ] ;
			lookupTable.hueChromaMaxLightness[ h ][ c ] = flatHueChromaMaxLightness[ lightnessIndex ] ;
		}

		for ( let l = 0 ; l <= 100 ; l ++ , chromaIndex ++ ) {
			lookupTable.hueLightnessMaxChroma[ h ][ l ] = flatHueLightnessMaxChroma[ chromaIndex ] ;
		}
	}
}

function getMaxChromaForHueAndLightness( hue , lightness ) {
	hue = Math.round( hue ) ;
	lightness = Math.round( lightness ) ;
	return lookupTable.hueLightnessMaxChroma[ hue ][ lightness ] ;
}

function getMinLightnessForHueAndChroma( hue , chroma ) {
	hue = Math.round( hue ) ;
	chroma = Math.round( chroma ) ;
	return lookupTable.hueChromaMinLightness[ hue ][ chroma ] ;
}

function getMaxLightnessForHueAndChroma( hue , chroma ) {
	hue = Math.round( hue ) ;
	chroma = Math.round( chroma ) ;
	return lookupTable.hueChromaMaxLightness[ hue ][ chroma ] ;
}

reconstructTables() ;

switch ( ( '' + process.argv[ 2 ] ).toLowerCase() ) {
	case 'c' :
	case 'chroma' : {
		let hue = + process.argv[ 3 ] || 0 ;
		let lightness = + process.argv[ 4 ] || 0 ;
		console.log( "Hue:" , hue , " Lightness:" , lightness , " --> max Chroma:" , getMaxChromaForHueAndLightness( hue , lightness ) ) ;
		break ;
	}
	case 'l' :
	case 'lightness' : {
		let hue = + process.argv[ 3 ] || 0 ;
		let chroma = + process.argv[ 4 ] || 0 ;
		console.log( "Hue:" , hue , " Chroma:" , chroma ,
			" --> min/max Lightness:" , getMinLightnessForHueAndChroma( hue , chroma ) ,
			"/" , getMaxLightnessForHueAndChroma( hue , chroma )
		) ;
		break ;
	}
	default :
		console.error( "Unknown command:" , process.argv[ 2 ] ) ;
}


