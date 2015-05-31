/**
 * Created by redcamel on 2015-05-04.
 * description
 기하구조와 재질을 포함할 수 있는 하나의 렌더링 단위인 Mesh를 생성함.
 Mesh는 장면 내에 아핀변환에 대응하는 행렬정보를 갖음. 이에 따라 비가시객체인 Camera 등도 Mesh를 상속하게 됨.
 id를 인자로 지정하면 Scene에 addChild하는 순간 id를 바인딩하며 실패하면 등록되지 않음.
 객체를 인자로 지정하면 Scene에 addChild하는 순간 Mesh내부의 Geometry나 Material이 임의의 id로 자동등록되며, shader Id가 존재하지 않으면 예외가 발생함( addChild 참조 )
 */
var Mesh = (function () {
    var SQRT = Math.sqrt, ATAN2 = Math.atan2, ASIN = Math.asin, COS = Math.cos, PIH = Math.PI * 0.5, PERPI = 180 / Math.PI
    var Mesh, fn;
    var F3, F3_2;
    F3 = new Float32Array(3), F3_2 = new Float32Array(3),
    Mesh = function Mesh(geometry, material) {
        // TODO 어디까지 허용할건가..
        if(this instanceof Mesh){
            if (geometry && !(typeof geometry == 'string' || geometry instanceof Geometry  )) this.error(0)
            if (material && !(typeof material == 'string' || material instanceof Material  )) this.error(1)
        }
        this._geometry = geometry,
        this._material = material,
        this._scene = null,
        this._parent = null,
        this.rotateX = 0, this.rotateY = 0, this.rotateZ = 0,
        this.scaleX = 1, this.scaleY = 1, this.scaleZ = 1,
        this.x = 0, this.y = 0, this.z = 0
    },
    fn = Mesh.prototype,
    fn.getGeometry = function getGeometry() {
        return this._scene ? this._geometry : null
    },
    fn.getMaterial = function getMaterial() { 
        return this._scene ? this._material : null
    },
    fn.getMatrix = function getMatrix() {
        this.matIdentity().matRotateX(this.rotateX).matRotateY(this.rotateY).matRotateZ(this.rotateZ).matTranslate(this.x,this.y,-this.z);
        return this
    },
    fn.getParent = function getParent() {
        return this._parent ? this._parent : null
    },
    fn.getPosition = function getPosition() {
        return F3[0] = this.x, F3[1] = this.y, F3[2] = this.z, F3
    },
    fn.getRotate = function getRotate() {
        return F3[0] = this.rotateX, F3[1] = this.rotateY, F3[2] = this.rotateZ, F3
    },
    fn.getScale = function getScale() {
        return F3[0] = this.scaleX, F3[1] = this.scaleY, F3[2] = this.scaleZ, F3
    },
    ///////////////////////////////////////////////////
    // set
    fn.setGeometry = function setGeometry(geometry) {
        if (!(geometry instanceof Geometry || typeof geometry == 'string')) this.error(0)
        if (this._scene) {
            if (this._geometry = typeof geometry == 'string') this._geometry = this._scene._geometrys[geometry]
            else this._geometry = geometry
            this._geometry._key = this._geometry._key || geometry
        }
        else this._geometry = geometry
        return this
    },
    fn.setMaterial = function setMaterial(material) {
        if (!(material instanceof Material || typeof material == 'string')) this.error(0)
        if (this._scene) {
            if (this._material = typeof material == 'string') this._material = this._scene._materials[material]
            else this._material = material
            this._material._key = this._material._key || material
        }
        else this._material = material
        return this
    },
    fn.lookAt = function lookAt(x,y,z){
        this.matIdentity(),
        F3[0] = this.x, F3[1] = this.y, F3[2] = this.z,
        F3_2[0] = x, F3_2[1] = y, F3_2[2] = z,
        this.matLookAt(F3, F3_2, [0, 1, 0]),
        this.matTranslate(F3)

        var d = this._rowData;
        var d11 = d[0], d12 = d[1], d13 = d[2], d21 = d[4], d22 = d[5], d23 = d[6], d31 = d[8], d32 = d[9], d33 = d[10];
        var radianX, radianY, radianZ;
        var md31 = -d31;

        if (md31 <= -1) radianY = -Math.PI * 0.5;
        else if (1 <= md31) radianY = Math.PI * 0.5;
        else radianY = ASIN(md31);
        var cosY = COS(radianY);
        if (cosY <= 0.001) radianZ = 0, radianX = ATAN2(-d23, d22)
        else radianZ = ATAN2(d21, d11), radianX = ATAN2(d32, d33)
        this.rotateX = radianX,
        this.rotateY = radianY
        this.rotateZ = radianZ

        //var dx = x - this.x;
        //var dy = y - this.y;
        //var dz = z - this.z;
        //this.rotationX = Math.atan2(dz, Math.sqrt(dx * dx + dy * dy)) - Math.PI / 2;
        //this.rotationY = 0;
        //this.rotationZ = -Math.atan2(dx, dy);
    },
    fn.setPosition = function setPosition() { 
        var len, arg0;
        len = arguments.length, arg0 = arguments[0];
        if (len == 1 && arg0 instanceof Array) this.x = arg0[0], this.y = arg0[1], this.z = arg0[2];
        else if (len > 2) this.x = arguments[0], this.y = arguments[1], this.z = arguments[2];
        else this.x = 0, this.y = 0, this.z = 0;
        return this;
    },
    fn.setRotate = function setRotate() { 
        var len, arg0;
        len = arguments.length, arg0 = arguments[0];
        if (len == 1 && arg0 instanceof Array) this.rotateX = arg0[0], this.rotateY = arg0[1], this.rotateZ = arg0[2];
        else if (len > 2) this.rotateX = arguments[0], this.rotateY = arguments[1], this.rotateZ = arguments[2];
        else this.rotateX = 0, this.rotateY = 0, this.rotateZ = 0;
        return this;
    },
    fn.setScale = function setScale() { 
        var len, arg0;
        len = arguments.length, arg0 = arguments[0];
        if (len == 1 && arg0 instanceof Array) this.scaleX = arg0[0], this.scaleY = arg0[1], this.scaleZ = arg0[2];
        else if (len > 2) this.scaleX = arguments[0], this.scaleY = arguments[1], this.scaleZ = arguments[2];
        else this.scaleX = 1, this.scaleY = 1, this.scaleZ = 1;
        return this;
    },
    fn.getCurrentVertexArray = function() {
        var geometry = this.getGeometry(),
            geometryVertexCount = geometry.getVertexCount(),
            geometryArray = geometry.getVertexArray(),
            geometryArrayLength = geometryArray.length,
            elementCountForVertex = geometryArrayLength / geometryVertexCount,
            meshPosition = this.getPosition(),
            meshRotation = this.getRotate(),
            meshScale = this.getScale();
console.log('in getCurrentVertexArray, this : ', this);
//console.log('in getCurrentVertexArray, this.getPosition : ', this.getPosition());
console.log('in getCurrentVertexArray, meshPosition : ', meshPosition);
console.log('in getCurrentVertexArray, meshRotation : ', meshRotation);
console.log('in getCurrentVertexArray, meshScale : ', meshScale);
console.log('in getCurrentVertexArray, this.getPosition : ', this.getPosition());
console.log('in getCurrentVertexArray, this.getRotation : ', this.getRotate());
console.log('in getCurrentVertexArray, this.getScale : ', this.getScale());
        var meshVertexArray = [];
        for (var i = 0, l = geometryArrayLength ; i < l ; i++) {
            (i % elementCountForVertex == 0) ? meshVertexArray.push(geometryArray[i]*this.scaleX*Math.cos(this.rotateZ) - geometryArray[i + 1]*this.scaleY*Math.sin(this.rotateZ) + this.x) :
            (i % elementCountForVertex == 1) ? meshVertexArray.push(geometryArray[i - 1]*this.scaleX*Math.sin(this.rotateZ) + geometryArray[i]*this.scaleY*Math.cos(this.rotateZ) + this.y) :
            (i % elementCountForVertex == 2) ? meshVertexArray.push(geometryArray[i] + this.z) : 0;
        }
        return meshVertexArray;
    },
    fn.contains = function(x, y, w, h) {
console.log('in contains, this : ', this);
console.log('in contains, this.position : ', this.getPosition());
        var decimalToNth = function(number) {
            return Math.round(number * 10000)/10000;
        };
        var geometry = this.getGeometry(),
            vs = this.getCurrentVertexArray(),
            n = geometry.getVertexCount(),
            vertCoords = vs.length / n,
            normalizedX = decimalToNth(2 * ( x / (w/2))),
            normalizedY = decimalToNth(5 * (y / (h/2))),
            rearX, frontX, rearY, frontY,
            i, j, isOdd = false;
console.log('in contains, vs : ', vs);
//console.log('in contains, vertCoords : ', vertCoords);
console.log('normalizedX   : ', normalizedX);
console.log('normalizedY   : ', normalizedY);
        for (i = 0, j = 0 ; j < n ; j++) {
console.log('iter : ', j);
            rearX = decimalToNth(vs[i = j * vertCoords]),
            rearY = decimalToNth(vs[++i]),
            frontX = decimalToNth(vs[i = (j + 1 == n ? 0 : j + 1) * vertCoords]),
            frontY = decimalToNth(vs[++i]);
console.log('  frontX : ', frontX);
console.log('  frontY : ', frontY);

            if ( (normalizedY <= rearY && normalizedY > frontY) || (normalizedY <= frontY && normalizedY > rearY) ) {
console.log('  y is crossed');
console.log('  in contains, x : ', x, ', y : ', y);
console.log('  normalizedX : ', normalizedX, ', normalizedY : ', normalizedY);
console.log('  x2 : ', frontX, ', y2 : ', frontY);
console.log('  x1 : ', rearX, ', y1 : ', rearY);
console.log('  cross X value : ', decimalToNth( (normalizedY - rearY) / ( (frontY - rearY) / (frontX - rearX) ) + rearX ));
console.log('  normalizedX   : ', normalizedX);
                if (decimalToNth( (normalizedY - rearY) / ( (frontY - rearY) / (frontX - rearX) ) + rearX ) < normalizedX) {
console.log('x is crossed');
                    isOdd = !isOdd;
                }
            }
        }
        return isOdd;
    };
    return MoGL.ext(Mesh, Matrix);
})();
