/*
The MIT License

Copyright © 2010-2022 three.js authors
Copyright © 2022 yernende

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE
*/

import {
  EventDispatcher,
  Matrix4,
  Plane,
  Raycaster,
  Vector2,
  Vector3
} from 'three';

const _plane = new Plane();
const _raycaster = new Raycaster();

const _pointer = new Vector2();
const _offset = new Vector3();
const _intersection = new Vector3();
const _worldPosition = new Vector3();
const _inverseMatrix = new Matrix4();

class DragControls extends EventDispatcher {

  constructor( _objects, _camera, _domElement, _staticObjects = [] ) {

    super();

    let _allObjects = [..._objects, ..._staticObjects];

    _domElement.style.touchAction = 'none'; // disable touch scroll

    let _selected = null, _hovered = null;

    const _intersections = [];

    //

    const scope = this;

    function activate() {

      _domElement.addEventListener( 'pointermove', onPointerMove );
      _domElement.addEventListener( 'pointerdown', onPointerDown );
      _domElement.addEventListener( 'pointerup', onPointerCancel );
      _domElement.addEventListener( 'pointerleave', onPointerCancel );

    }

    function deactivate() {

      _domElement.removeEventListener( 'pointermove', onPointerMove );
      _domElement.removeEventListener( 'pointerdown', onPointerDown );
      _domElement.removeEventListener( 'pointerup', onPointerCancel );
      _domElement.removeEventListener( 'pointerleave', onPointerCancel );

      _domElement.style.cursor = '';

    }

    function dispose() {

      deactivate();

    }

    function getObjects() {

      return _objects;

    }

    function getRaycaster() {

      return _raycaster;

    }

    function onPointerMove( event ) {

      if ( scope.enabled === false ) return;

      updatePointer( event );

      _raycaster.setFromCamera( _pointer, _camera );

      if ( _selected ) {
        if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {
          _selected.position.copy( _intersection.sub( _offset ).applyMatrix4( _inverseMatrix ) );

        }

        scope.dispatchEvent( { type: 'drag', object: _selected } );

        return;

      }

      // hover support

      if ( event.pointerType === 'mouse' || event.pointerType === 'pen' ) {

        _intersections.length = 0;

        _raycaster.setFromCamera( _pointer, _camera );
        _raycaster.intersectObjects( _allObjects, true, _intersections );

        if ( _intersections.length > 0 ) {
          const object = _intersections[ 0 ].object;
          const staticObjectsIncludesObject = _staticObjects.includes(object);

          if ( !staticObjectsIncludesObject ) {
            _plane.setFromNormalAndCoplanarPoint( _camera.getWorldDirection( _plane.normal ), _worldPosition.setFromMatrixPosition( object.matrixWorld ) );
          };


          if ( _hovered !== object && _hovered !== null ) {

            scope.dispatchEvent( { type: 'hoveroff', object: _hovered } );

            _domElement.style.cursor = 'auto';
            _hovered = null;

          }

          if ( _hovered !== object && !staticObjectsIncludesObject ) {
            scope.dispatchEvent( { type: 'hoveron', object: object } );

            _domElement.style.cursor = 'pointer';
            _hovered = object;

          }

        } else {

          if ( _hovered !== null ) {

            scope.dispatchEvent( { type: 'hoveroff', object: _hovered } );

            _domElement.style.cursor = 'auto';
            _hovered = null;

          }

        }

      }

    }

    function onPointerDown( event ) {
      if ( event.pointerType == 'mouse' && event.button != 0 ) return;

      if ( scope.enabled === false ) return;

      updatePointer( event );

      _intersections.length = 0;

      _raycaster.setFromCamera( _pointer, _camera );
      _raycaster.intersectObjects( _allObjects, true, _intersections );

      if ( _intersections.length > 0 ) {
        if ( _staticObjects.includes(_intersections[0].object) ) return;

        _selected = ( scope.transformGroup === true ) ? _objects[ 0 ] : _intersections[ 0 ].object;

        _plane.setFromNormalAndCoplanarPoint( _camera.getWorldDirection( _plane.normal ), _worldPosition.setFromMatrixPosition( _selected.matrixWorld ) );

        if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {

          _inverseMatrix.copy( _selected.parent.matrixWorld ).invert();
          _offset.copy( _intersection ).sub( _worldPosition.setFromMatrixPosition( _selected.matrixWorld ) );

        }

        _domElement.style.cursor = 'move';

        scope.dispatchEvent( { type: 'dragstart', object: _selected } );

      }


    }

    function onPointerCancel( event ) {
      if ( event.pointerType == 'mouse' && event.button != 0 ) return;

      if ( scope.enabled === false ) return;

      if ( _selected ) {

        scope.dispatchEvent( { type: 'dragend', object: _selected } );

        _selected = null;

      }

      _domElement.style.cursor = _hovered ? 'pointer' : 'auto';

    }

    function updatePointer( event ) {

      const rect = _domElement.getBoundingClientRect();

      _pointer.x = ( event.clientX - rect.left ) / rect.width * 2 - 1;
      _pointer.y = - ( event.clientY - rect.top ) / rect.height * 2 + 1;

    }

    activate();

    // API

    this.enabled = true;
    this.transformGroup = false;

    this.activate = activate;
    this.deactivate = deactivate;
    this.dispose = dispose;
    this.getObjects = getObjects;
    this.getRaycaster = getRaycaster;

  }

}

export { DragControls };
