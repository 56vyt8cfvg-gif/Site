(function(){
var VS='attribute vec3 p;attribute vec3 n;attribute vec3 c;uniform mat4 vp;uniform vec3 mn,mx;varying vec3 vn,vc,vw;void main(){vec3 w=mn+(p*.5+.5)*(mx-mn);vw=w;vn=n;vc=c;gl_Position=vp*vec4(w,1.);}';
var FS='precision mediump float;varying vec3 vn,vc,vw;uniform vec3 eye;void main(){vec3 N=normalize(vn);vec3 L=normalize(vec3(.45,.85,.35));float d=max(dot(N,L),0.);float h=.5+.5*N.y;vec3 V=normalize(eye-vw);float r=pow(1.-max(dot(N,V),0.),3.);vec3 col=vc*(.34+.22*h+.62*d)+vec3(1.,.85,.55)*r*.12;gl_FragColor=vec4(col,1.);}';
function M4(){return new Float32Array(16)}
function persp(f,a,n,fa){var t=1/Math.tan(f/2),m=M4();m[0]=t/a;m[5]=t;m[10]=(fa+n)/(n-fa);m[11]=-1;m[14]=2*fa*n/(n-fa);return m}
function look(e,c){var z=[e[0]-c[0],e[1]-c[1],e[2]-c[2]],l=Math.hypot(z[0],z[1],z[2]);z=z.map(function(v){return v/l});var u=[0,1,0],x=[u[1]*z[2]-u[2]*z[1],u[2]*z[0]-u[0]*z[2],u[0]*z[1]-u[1]*z[0]];l=Math.hypot(x[0],x[1],x[2]);x=x.map(function(v){return v/l});var y=[z[1]*x[2]-z[2]*x[1],z[2]*x[0]-z[0]*x[2],z[0]*x[1]-z[1]*x[0]];var m=M4();
 m[0]=x[0];m[4]=x[1];m[8]=x[2];m[1]=y[0];m[5]=y[1];m[9]=y[2];m[2]=z[0];m[6]=z[1];m[10]=z[2];m[12]=-(x[0]*e[0]+x[1]*e[1]+x[2]*e[2]);m[13]=-(y[0]*e[0]+y[1]*e[1]+y[2]*e[2]);m[14]=-(z[0]*e[0]+z[1]*e[1]+z[2]*e[2]);m[15]=1;return m}
function mul(a,b){var o=M4();for(var i=0;i<4;i++)for(var j=0;j<4;j++){var s=0;for(var k=0;k<4;k++)s+=a[k*4+j]*b[i*4+k];o[i*4+j]=s}return o}
var cache={};
window.V3D=function(cv){var gl=cv.getContext('webgl',{antialias:true,alpha:true});if(!gl)return null;
 function sh(t,s){var o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);return o}
 var pg=gl.createProgram();gl.attachShader(pg,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pg,sh(gl.FRAGMENT_SHADER,FS));gl.bindAttribLocation(pg,0,'p');gl.bindAttribLocation(pg,1,'n');gl.bindAttribLocation(pg,2,'c');gl.linkProgram(pg);gl.useProgram(pg);
 var U={vp:gl.getUniformLocation(pg,'vp'),mn:gl.getUniformLocation(pg,'mn'),mx:gl.getUniformLocation(pg,'mx'),eye:gl.getUniformLocation(pg,'eye')};[0,1,2].forEach(function(a){gl.enableVertexAttribArray(a)});gl.enable(gl.DEPTH_TEST);
 var bP=gl.createBuffer(),bN=gl.createBuffer(),bC=gl.createBuffer(),n=0,mn=[0,0,0],mx=[1,1,1],c=[0,0,0],rad=1,az=.6,po=1.1,z=1,auto=true,raf=0,tok=0;
 function draw(){raf=0;if(!n)return;var W=cv.clientWidth,H=cv.clientHeight,dpr=Math.min(2,window.devicePixelRatio||1);if(cv.width!==Math.round(W*dpr)||cv.height!==Math.round(H*dpr)){cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr)}
  gl.viewport(0,0,cv.width,cv.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);var d=rad/Math.sin(.34)*1.18*z*Math.max(1,H/W*.8);
  var e=[c[0]+d*Math.sin(po)*Math.sin(az),c[1]+d*Math.cos(po),c[2]+d*Math.sin(po)*Math.cos(az)];gl.uniformMatrix4fv(U.vp,false,mul(persp(.64,W/H,.05,400),look(e,c)));gl.uniform3fv(U.eye,e);gl.uniform3fv(U.mn,mn);gl.uniform3fv(U.mx,mx);
  gl.bindBuffer(gl.ARRAY_BUFFER,bP);gl.vertexAttribPointer(0,3,gl.SHORT,true,0,0);gl.bindBuffer(gl.ARRAY_BUFFER,bN);gl.vertexAttribPointer(1,3,gl.BYTE,true,0,0);gl.bindBuffer(gl.ARRAY_BUFFER,bC);gl.vertexAttribPointer(2,3,gl.UNSIGNED_BYTE,true,0,0);gl.drawArrays(gl.TRIANGLES,0,n)}
 function req(){if(!raf)raf=requestAnimationFrame(draw)}
 var last=0;function spin(t){if(auto&&n&&document.body.contains(cv)){az+=(last?Math.min(50,t-last):16)*.00035;req()}last=t;requestAnimationFrame(spin)}requestAnimationFrame(spin);
 function setBuf(buf){var dv=new DataView(buf),k=dv.getUint32(0,true);var f=[];for(var i=0;i<7;i++)f.push(dv.getFloat32(4+i*4,true));n=k;mn=f.slice(0,3);mx=f.slice(3,6);
  gl.bindBuffer(gl.ARRAY_BUFFER,bP);gl.bufferData(gl.ARRAY_BUFFER,new Int16Array(buf,32,k*3),gl.STATIC_DRAW);gl.bindBuffer(gl.ARRAY_BUFFER,bN);gl.bufferData(gl.ARRAY_BUFFER,new Int8Array(buf,32+k*6,k*3),gl.STATIC_DRAW);gl.bindBuffer(gl.ARRAY_BUFFER,bC);gl.bufferData(gl.ARRAY_BUFFER,new Uint8Array(buf,32+k*9,k*3),gl.STATIC_DRAW);
  c=[(mn[0]+mx[0])/2,(mn[1]+mx[1])/2,(mn[2]+mx[2])/2];rad=Math.max(.2,Math.hypot(mx[0]-mn[0],mx[1]-mn[1],mx[2]-mn[2])/2);z=1;po=1.1;req()}
 var api={load:function(url,cb){var t=++tok;var e=(window.P3D||{})[url],src=e?e[0]:url;var p=cache[src]||(cache[src]=fetch(src).then(function(r){if(!r.ok)throw 0;return r.arrayBuffer()}));p.then(function(b){if(t===tok){setBuf(e?b.slice(e[1],e[1]+e[2]):b);auto=true;cb&&cb(true)}},function(){cb&&cb(false)})}};
 var pts={},pd=0,sx,sy,a0,p0,z0;
 cv.addEventListener('pointerdown',function(e){cv.setPointerCapture(e.pointerId);pts[e.pointerId]=[e.clientX,e.clientY];auto=false;var k=Object.keys(pts);if(k.length===1){sx=e.clientX;sy=e.clientY;a0=az;p0=po}else if(k.length===2){var a=pts[k[0]],b=pts[k[1]];pd=Math.hypot(a[0]-b[0],a[1]-b[1]);z0=z}});
 cv.addEventListener('pointermove',function(e){if(!pts[e.pointerId])return;pts[e.pointerId]=[e.clientX,e.clientY];var k=Object.keys(pts);if(k.length===1){az=a0-(e.clientX-sx)*.012;po=Math.max(.18,Math.min(1.55,p0-(e.clientY-sy)*.01));req()}else if(k.length===2){var a=pts[k[0]],b=pts[k[1]],d=Math.hypot(a[0]-b[0],a[1]-b[1]);z=Math.max(.45,Math.min(2.2,z0*pd/d));req()}});
 function up(e){delete pts[e.pointerId]}cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
 cv.addEventListener('wheel',function(e){e.preventDefault();z=Math.max(.45,Math.min(2.2,z*(1+e.deltaY*.0012)));auto=false;req()},{passive:false});
 window.addEventListener('resize',req);return api};
})();
