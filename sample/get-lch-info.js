#!/usr/bin/env node

"use strict" ;

const lib = require( '..' ) ;
const Palette = lib.Palette ;

switch ( ( '' + process.argv[ 2 ] ).toLowerCase() ) {
	case 'c' :
	case 'chroma' : {
		let hue = + process.argv[ 3 ] || 0 ;
		let lightness = + process.argv[ 4 ] || 0 ;
		console.log(
			"Hue:" , hue , " Lightness:" , lightness ,
			"  --> max Chroma:" , Palette.getMaxChromaForHueAndLightness( hue , lightness ) ,
			"  (hue max Chroma: " + Palette.getMaxChromaForHue( hue ) + ")"
		) ;
		break ;
	}
	case 'l' :
	case 'lightness' : {
		let hue = + process.argv[ 3 ] || 0 ;
		let chroma = + process.argv[ 4 ] || 0 ;
		console.log(
			"Hue:" , hue , " Chroma:" , chroma ,
			"  --> min/max Lightness:" , Palette.getMinLightnessForHueAndChroma( hue , chroma ) ,
			"/" , Palette.getMaxLightnessForHueAndChroma( hue , chroma ) ,
			"  (hue max Chroma: " + Palette.getMaxChromaForHue( hue ) + ")"
		) ;
		break ;
	}
	default :
		console.error( "Unknown command:" , process.argv[ 2 ] ) ;
}

