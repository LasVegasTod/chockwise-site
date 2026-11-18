(function(){
var f=document.querySelector('figure.lm');if(!f||!window.L)return;
var box=f.querySelector('.lm-box');
fetch(f.dataset.map).then(function(r){if(!r.ok)throw r.status;return r.json();}).then(draw).catch(function(){});
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function draw(D){
  var touch=window.matchMedia&&matchMedia('(pointer:coarse)').matches;
  var el=document.createElement('div');el.className='lm-map';box.appendChild(el);
  var map=L.map(el,{zoomSnap:0.25,zoomDelta:0.5,scrollWheelZoom:false,dragging:!touch,tap:false,attributionControl:true,
    zoomControl:true,preferCanvas:true,maxZoom:19});f._lm=map;
  map.attributionControl.setPrefix(false).addAttribution('Map &copy; OpenStreetMap contributors · Flight data: FlightAware');
  var R=L.canvas({padding:0.5});
  var paint={a:['#e9ecf0','#d6dae0',1],r:['#7b8190','#7b8190',0],w:['#d1d5db','#d1d5db',0],T:['#dfe2ea','#1e3a8a',1]};
  function area(k){D.areas.forEach(function(a){if(a[0]!==k)return;var p=paint[k];
    L.polygon(a[1],{renderer:R,fillColor:p[0],fillOpacity:1,color:p[1],weight:p[2],stroke:p[2]>0,interactive:false}).addTo(map);});}
  area('a');area('w');area('r');
  var lines=D.lines.slice().sort(function(a,b){return a[0]===b[0]?0:a[0]==='w'?-1:1;}).map(function(l){return L.polyline(l[1],{renderer:R,color:paint[l[0]][0],weight:4,lineCap:'butt',interactive:false,k:l[0]}).addTo(map);});
  area('T');
  function widths(){var z=map.getZoom(),c=map.getCenter(),m=40075016*Math.cos(c.lat*Math.PI/180)/Math.pow(2,z+8);
    lines.forEach(function(l){l.setStyle({weight:Math.max(1,(l.options.k==='r'?45:23)/m)});});}
  var names={};D.key.forEach(function(k){if(k[0])names[k[0]]=k[1];});
  var bounds=L.latLngBounds([]),nums=[],shapes=[];
  function w(){return map.getZoom()>=16?1.5:0.6;}
  D.gates.forEach(function(g){
    var shape=L.polygon(g.r,{renderer:R,fillColor:g.f,fillOpacity:g.o,color:g.s,weight:1.5,dashArray:g.d?'4 3':null});
    var who=g.a?esc(names[g.a]||g.a)+': ':'';
    var tip='<div class="lm-tip"><b>Gate '+esc(g.g)+'</b><br>'+who+esc(g.u)+'</div>';
    shape.bindTooltip(tip,{sticky:!touch,direction:'top',opacity:1});
    shape.on('mouseover',function(){shape.setStyle({weight:3,fillOpacity:Math.min(1,g.o+0.25)});});
    shape.on('mouseout',function(){shape.setStyle({weight:w(),fillOpacity:g.o});});shapes.push(shape);
    shape.addTo(map);bounds.extend(shape.getBounds());
    nums.push(L.marker(g.at,{icon:L.divIcon({className:'lm-num',html:esc(g.g),iconSize:[44,14],iconAnchor:[22,7]}),interactive:false,keyboard:false}));
  });
  var numLayer=L.layerGroup(nums);
  function labels(){var on=map.getZoom()>=16.75;if(on&&!map.hasLayer(numLayer))numLayer.addTo(map);else if(!on&&map.hasLayer(numLayer))map.removeLayer(numLayer);}
  map.on('zoomend',function(){labels();widths();shapes.forEach(function(s){s.setStyle({weight:w()});});});
  var Key=L.Control.extend({options:{position:'topright'},onAdd:function(){var d=L.DomUtil.create('div','lm-key');
    d.innerHTML='<b>Gates by airline</b>'+D.key.map(function(k){return '<div><i style="background:'+k[2]+(k[0]?'':';opacity:.6')+'"></i>'+esc(k[1])+' <span>'+k[3]+'</span></div>';}).join('');
    if(el.clientWidth<640)d.classList.add('shut');d.querySelector('b').onclick=function(){d.classList.toggle('shut');};
    L.DomEvent.disableClickPropagation(d);L.DomEvent.disableScrollPropagation(d);return d;}});
  new Key().addTo(map);
  map.fitBounds(bounds,{padding:[16,16]});map.setMinZoom(Math.max(1,map.getZoom()-2));
  map.setMaxBounds(bounds.pad(1.5));widths();labels();shapes.forEach(function(s){s.setStyle({weight:w()});});
  var img=box.querySelector('img.shot');if(img)img.style.visibility='hidden';
  f.classList.add('live');
  // mice: the wheel zooms once the map is clicked, so the page still scrolls past it; touch: one finger scrolls the
  // page until 'Explore the map' is tapped, then it drags the map until 'Done'
  if(!touch){map.on('click',function(){map.scrollWheelZoom.enable();});
    map.on('mouseout',function(){map.scrollWheelZoom.disable();});}
  else{var b=document.createElement('button');b.className='lm-tap';b.type='button';b.textContent='Tap to explore the map';
    var d=document.createElement('button');d.className='lm-done';d.type='button';d.textContent='Done';
    box.appendChild(b);box.appendChild(d);
    b.onclick=function(){f.classList.add('active');map.dragging.enable();};
    d.onclick=function(){f.classList.remove('active');map.dragging.disable();};}
}
})();
