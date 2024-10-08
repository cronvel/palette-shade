/*
	Palette Shade

	Copyright (c) 2023 Cédric Ronvel

	The MIT License (MIT)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/

"use strict" ;



const Palette = require( './Palette.js' ) ;
const Color = require( './Color.js' ) ;



function FixedPalette( params = {} , mode = 'hex' ) {
	Palette.call( this , params.palette ?? params ) ;

	this.shades = + params.shades || 0 ;
	this.tints = + params.tints || 0 ;
	this.tones = + params.tones || 0 ;

	this.indexed = [] ;
	this.named = null ;

	this.generate( mode ) ;
}

module.exports = FixedPalette ;

FixedPalette.prototype = Object.create( Palette.prototype ) ;
FixedPalette.prototype.constructor = FixedPalette ;



FixedPalette.prototype.generate = function( mode = 'hex' ) {
	this.indexed.length = 0 ;
	this.named = {} ;

	for ( let colorName of Object.keys( this.fixedColors ) ) {
		this.generateOne( { baseName: colorName } , mode ) ;
	}

	if ( this.tints ) { this.generateOne( { baseName: 'tint-color' } , mode ) ; }
	if ( this.shades ) { this.generateOne( { baseName: 'shade-color' } , mode ) ; }
	if ( this.tones ) { this.generateOne( { baseName: 'tone-color' } , mode ) ; }

	for ( let colorName of Object.keys( this.baseColors ) ) {
		for ( let i = this.tints ; i > 0 ; i -- ) {
			this.generateOne( { baseName: colorName , tintLevel: i } , mode ) ;
		}

		this.generateOne( { baseName: colorName } , mode ) ;

		for ( let i = 1 ; i <= this.shades ; i ++ ) {
			this.generateOne( { baseName: colorName , shadeLevel: i } , mode ) ;
		}
	}
} ;



FixedPalette.prototype.generateOne = function( colorParams , mode = 'hex' ) {
	let color = new Color( colorParams ) ;

	let value =
		mode === 'chroma' ? this.get( color ) :
		mode === 'hex' ? this.getHex( color ) :
		mode === 'rgb' ? this.getRgb( color ) :
		this.get( color ) ;

	this.indexed.push( value ) ;
	this.named[ color.cname() ] = value ;
} ;

