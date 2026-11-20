import * as THREE from "./vendor/three.module.min.js";

const NODE_POSITIONS = {
  city: new THREE.Vector3(-14, 3, -9),
  logistics: new THREE.Vector3(15, 2.2, -11),
  factory: new THREE.Vector3(2, 4.8, 1),
  client: new THREE.Vector3(17, 4.2, 9),
  river: new THREE.Vector3(-13, 1.2, 11)
};

function seeded(seed = 618) {
  let value = seed >>> 0;
  return () => ((value = Math.imul(1664525, value) + 1013904223 >>> 0) / 4294967296);
}

function box(scene, x, z, w, d, h, material, y = 0) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y + h / 2, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

function strip(points, width, material, y = .04) {
  const vertices = [];
  for (let i = 0; i < points.length; i++) {
    const current = points[i];
    const prev = points[Math.max(0, i - 1)];
    const next = points[Math.min(points.length - 1, i + 1)];
    const dx = next.x - prev.x, dz = next.z - prev.z;
    const len = Math.hypot(dx, dz) || 1;
    const nx = -dz / len * width, nz = dx / len * width;
    vertices.push(current.x + nx, y, current.z + nz, current.x - nx, y, current.z - nz);
  }
  const indices = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
    indices.push(a, b, c, b, d, c);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return new THREE.Mesh(geometry, material);
}

function buildWorld(scene) {
  const rand = seeded();
  const terrain = new THREE.Mesh(
    new THREE.PlaneGeometry(82, 62, 28, 22),
    new THREE.MeshStandardMaterial({ color: 0x263b31, roughness: .96, metalness: 0 })
  );
  const pos = terrain.geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    const edge = Math.max(0, Math.abs(x) - 24) * .12;
    pos.setZ(i, Math.sin(x * .18) * .22 + Math.cos(y * .21) * .18 + edge + rand() * .08);
  }
  pos.needsUpdate = true;
  terrain.geometry.computeVertexNormals();
  terrain.rotation.x = -Math.PI / 2;
  terrain.receiveShadow = true;
  scene.add(terrain);

  const riverMat = new THREE.MeshPhysicalMaterial({ color: 0x315f67, roughness: .18, metalness: .12, transparent: true, opacity: .9, clearcoat: 1 });
  const riverPoints = [];
  for (let z = -31; z <= 31; z += 2.4) riverPoints.push(new THREE.Vector3(-10 + Math.sin(z * .15) * 4.3, 0, z));
  const river = strip(riverPoints, 2.3, riverMat, .14);
  scene.add(river);

  const roadMat = new THREE.MeshStandardMaterial({ color: 0x293035, roughness: .82 });
  const road1 = strip([new THREE.Vector3(-39,0,-4),new THREE.Vector3(-8,0,-3),new THREE.Vector3(8,0,-7),new THREE.Vector3(40,0,-7)], .72, roadMat, .18);
  const road2 = strip([new THREE.Vector3(1,0,-30),new THREE.Vector3(3,0,-8),new THREE.Vector3(1,0,16),new THREE.Vector3(7,0,30)], .62, roadMat, .19);
  scene.add(road1, road2);
  const railMat = new THREE.MeshStandardMaterial({ color: 0x586066, metalness: .75, roughness: .45 });
  scene.add(strip([new THREE.Vector3(-38,0,-14),new THREE.Vector3(-2,0,-13),new THREE.Vector3(39,0,-15)], .10, railMat, .23));
  scene.add(strip([new THREE.Vector3(-38,0,-13.3),new THREE.Vector3(-2,0,-12.3),new THREE.Vector3(39,0,-14.3)], .10, railMat, .23));

  // Physical links between city, river and industry make the map read as one place.
  const bridgeMat=new THREE.MeshStandardMaterial({color:0x667176,metalness:.58,roughness:.48});
  const lampMat=new THREE.MeshStandardMaterial({color:0xffc875,emissive:0xffa742,emissiveIntensity:2.2,roughness:.28});
  [-4.1,7.2].forEach((z,bridgeIndex)=>{
    box(scene,-10,z,12.5,1.55,.28,bridgeMat,.42);
    [-14,-10,-6].forEach(x=>box(scene,x,z,.42,1.1,1.05,bridgeMat,-.18));
    for(let i=0;i<7;i++){
      const x=-15.2+i*1.75;
      const mast=new THREE.Mesh(new THREE.CylinderGeometry(.035,.055,1.35,6),bridgeMat);mast.position.set(x,1.18,z+(bridgeIndex?-.55:.55));scene.add(mast);
      const bulb=new THREE.Mesh(new THREE.SphereGeometry(.1,8,6),lampMat);bulb.position.set(x,1.84,z+(bridgeIndex?-.55:.55));scene.add(bulb)
    }
  });
  const movers=[];
  const makeMover=(color,z,speed,offset,scale=1)=>{const group=new THREE.Group();const body=box(group,0,0,1.2*scale,.55*scale,.42*scale,new THREE.MeshStandardMaterial({color,metalness:.25,roughness:.46}),.16);body.castShadow=true;const light=new THREE.Mesh(new THREE.BoxGeometry(.24*scale,.08,.05),lampMat);light.position.set(.58*scale,.38*scale,.28*scale);group.add(light);group.position.z=z;group.userData={speed,offset};scene.add(group);movers.push(group)};
  makeMover(0xd8dcda,-7.05,1.45,4,.9);makeMover(0xb13c32,-6.6,1.18,29,1);makeMover(0x477487,-3.3,.9,51,.85);
  const train=new THREE.Group();
  for(let i=0;i<5;i++)box(train,-i*2.05,0,1.85,.72,.72,new THREE.MeshStandardMaterial({color:i?0x59656a:0xa7352d,metalness:.46,roughness:.42}),.25);
  train.position.z=-13.65;train.userData={speed:.72,offset:18,train:true};scene.add(train);movers.push(train);

  const cityMats = [0x8e8374,0xa2927b,0x6f7775,0xb0a28b].map(c=>new THREE.MeshStandardMaterial({ color:c, roughness:.88 }));
  for (let i = 0; i < 58; i++) {
    const x = -28 + rand() * 18, z = -18 + rand() * 22;
    if (Math.abs(x + 10) < 3.5) continue;
    const h = 1.2 + rand() * 3.8;
    box(scene, x, z, 1.1 + rand()*1.8, 1 + rand()*1.6, h, cityMats[i % cityMats.length]);
  }
  const stone = new THREE.MeshStandardMaterial({color:0x827968,roughness:.9});
  box(scene,-18,-10,4.5,2.2,2.4,stone);
  const tower1=box(scene,-19.1,-10,1,1,6.4,stone), tower2=box(scene,-16.9,-10,1,1,6.4,stone);
  const roofMat=new THREE.MeshStandardMaterial({color:0x404743,roughness:.9});
  [tower1,tower2].forEach(t=>{const roof=new THREE.Mesh(new THREE.ConeGeometry(.75,2,4),roofMat);roof.position.set(t.position.x,7.4,t.position.z);roof.rotation.y=Math.PI/4;scene.add(roof)});

  const factoryMat = new THREE.MeshStandardMaterial({color:0x7b8585,metalness:.32,roughness:.58});
  const roof = new THREE.MeshStandardMaterial({color:0x424b4e,metalness:.48,roughness:.45});
  box(scene,-1,1,10,7,3.4,factoryMat);
  box(scene,7,2,5,6,4.7,factoryMat);
  box(scene,2,-4,7,3,2.8,factoryMat);
  for(let i=0;i<5;i++) box(scene,-4+i*2.1,1,1.45,5.8,.22,roof,3.4);
  const windowMat = new THREE.MeshStandardMaterial({color:0x9ed6cf,emissive:0x56a69e,emissiveIntensity:1.2,metalness:.35,roughness:.25});
  for(let i=0;i<8;i++) box(scene,-4.2+i*1.15,4.55,.65,.08,.68,windowMat,.9);
  const pipeMat=new THREE.MeshStandardMaterial({color:0x7a8588,metalness:.8,roughness:.3});
  for(let i=0;i<3;i++){const p=new THREE.Mesh(new THREE.CylinderGeometry(.32,.4,5.5,12),pipeMat);p.position.set(6+i*1.2,5.9,-1.2);p.castShadow=true;scene.add(p)}
  const solarMat=new THREE.MeshStandardMaterial({color:0x263f54,metalness:.5,roughness:.25});
  for(let i=0;i<9;i++) box(scene,-4+i*1.05,1,0.78,4.5,.08,solarMat,3.75);

  const clientMat=new THREE.MeshStandardMaterial({color:0x59696d,metalness:.42,roughness:.45});
  box(scene,18,9,9,7,3.2,clientMat);
  for(let i=0;i<6;i++) box(scene,14.4+i*1.45,12.55,.9,.1,1.1,windowMat,.8);
  const serverMat=new THREE.MeshStandardMaterial({color:0x253439,emissive:0x2b8d83,emissiveIntensity:.8,metalness:.6});
  for(let i=0;i<10;i++) box(scene,14+i*.85,9,.52,3.7,.18,serverMat,3.35);

  const logisticsMat=new THREE.MeshStandardMaterial({color:0x88775f,roughness:.8});
  for(let i=0;i<14;i++) box(scene,10+(i%7)*1.55,-13+Math.floor(i/7)*1.3,1.35,1.05,.75,logisticsMat);
  for(let i=0;i<7;i++){const truck=box(scene,8+i*2.5,-9.8,1.65,.62,.55,new THREE.MeshStandardMaterial({color:i%2?0xb4b9b6:0x8f2f28,roughness:.7}));truck.rotation.y=.08}

  const communityMat=new THREE.MeshStandardMaterial({color:0xa1957e,roughness:.9});
  for(let i=0;i<18;i++){const x=-23+rand()*11,z=8+rand()*14;box(scene,x,z,1.4,1.2,1.35,communityMat);const r=new THREE.Mesh(new THREE.ConeGeometry(1.05,.8,4),new THREE.MeshStandardMaterial({color:0x733d34,roughness:.9}));r.position.set(x,2.05,z);r.rotation.y=Math.PI/4;scene.add(r)}

  const treeMat=new THREE.MeshStandardMaterial({color:0x365b3e,roughness:1});
  const trunkMat=new THREE.MeshStandardMaterial({color:0x604d38,roughness:1});
  for(let i=0;i<90;i++){
    const x=-37+rand()*74,z=-27+rand()*54;
    if((x>-7&&x<11&&z>-7&&z<7)||(x<-8&&z<4&&z>-20)||(x>10&&z>4&&z<15)) continue;
    const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.07,.1,.65,5),trunkMat);trunk.position.set(x,.34,z);
    const crown=new THREE.Mesh(new THREE.ConeGeometry(.38+rand()*.3,1.1+rand()*.7,6),treeMat);crown.position.set(x,1.05,z);scene.add(trunk,crown)
  }

  const windMat=new THREE.MeshStandardMaterial({color:0xc2cbca,metalness:.55,roughness:.35});
  for(let i=0;i<3;i++){
    const x=26+i*4,z=-23+i*2;const mast=new THREE.Mesh(new THREE.CylinderGeometry(.08,.18,6,8),windMat);mast.position.set(x,3,z);scene.add(mast);
    const hub=new THREE.Mesh(new THREE.SphereGeometry(.2,10,8),windMat);hub.position.set(x,6,z);scene.add(hub);
    for(let b=0;b<3;b++){const blade=box(scene,x,z,.12,3,.05,windMat,6);blade.geometry.translate(0,0,1.45);blade.rotation.y=b*Math.PI*2/3}
  }

  const smokeGeo=new THREE.BufferGeometry();const smoke=[];
  for(let i=0;i<80;i++) smoke.push(5.5+rand()*3,6+rand()*8,-1+rand()*1.8);
  smokeGeo.setAttribute('position',new THREE.Float32BufferAttribute(smoke,3));
  const smokeMat=new THREE.PointsMaterial({color:0xbfc9c7,size:.45,transparent:true,opacity:.16,depthWrite:false});
  const smokePoints=new THREE.Points(smokeGeo,smokeMat);scene.add(smokePoints);
  return {riverMat,windowMat,smokeMat,smokePoints,movers,lampMat};
}

export function initWorld3D(container, onNodeClick) {
  const canvas = document.createElement("canvas");
  canvas.id = "scene3d";
  container.prepend(canvas);
  const renderer = new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:"high-performance"});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x08151d);scene.fog=new THREE.FogExp2(0x10232b,.016);
  const camera=new THREE.PerspectiveCamera(42,1,.1,160);
  const hemisphere=new THREE.HemisphereLight(0xa9c7d8,0x111a17,1.35);scene.add(hemisphere);
  const ambient=new THREE.AmbientLight(0x29424c,.65);scene.add(ambient);
  const sun=new THREE.DirectionalLight(0xffc987,3.45);sun.position.set(-22,30,18);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-42;sun.shadow.camera.right=42;sun.shadow.camera.top=34;sun.shadow.camera.bottom=-34;scene.add(sun);
  let activeTheme='';
  function syncThemeLighting(){const theme=document.body?.dataset?.sceneTheme||'night';if(theme===activeTheme)return;activeTheme=theme;if(theme==='day'){scene.background.set(0xa9cbd0);scene.fog.color.set(0xc6dcde);hemisphere.color.set(0xe8f6f5);hemisphere.groundColor.set(0x66867f);hemisphere.intensity=2.15;ambient.color.set(0xbad8d3);ambient.intensity=1.2;sun.color.set(0xffe0a6);sun.intensity=4.15;renderer.toneMappingExposure=1.36}else{scene.background.set(0x08151d);scene.fog.color.set(0x10232b);hemisphere.color.set(0xa9c7d8);hemisphere.groundColor.set(0x111a17);hemisphere.intensity=1.35;ambient.color.set(0x29424c);ambient.intensity=.65;sun.color.set(0xffc987);sun.intensity=3.45;renderer.toneMappingExposure=1.08}}
  syncThemeLighting();
  const cityGlow=new THREE.PointLight(0xffa75b,18,30,1.8);cityGlow.position.set(-18,7,-8);scene.add(cityGlow);
  const industryGlow=new THREE.PointLight(0x58bfc6,15,27,1.8);industryGlow.position.set(2,7,1);scene.add(industryGlow);
  const world=buildWorld(scene);
  let yaw=.72,pitch=.56,distance=47,target=new THREE.Vector3(0,1,0),drag=false,lastX=0,lastY=0,active='factory',phase=0,lastInteraction=performance.now();
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nodeEls=[...container.querySelectorAll('[data-node]')];
  nodeEls.forEach(el=>el.addEventListener('click',()=>onNodeClick(el.dataset.node)));
  function updateCamera(){camera.position.set(target.x+Math.sin(yaw)*Math.cos(pitch)*distance,target.y+Math.sin(pitch)*distance,target.z+Math.cos(yaw)*Math.cos(pitch)*distance);camera.lookAt(target)}
  function resize(){const w=container.clientWidth,h=container.clientHeight;if(w&&h){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}}
  function projectNodes(){const rect=container.getBoundingClientRect();nodeEls.forEach(el=>{const p=NODE_POSITIONS[el.dataset.node].clone().project(camera);const visible=p.z<1;el.style.transform=`translate(${(p.x*.5+.5)*rect.width}px,${(-p.y*.5+.5)*rect.height}px)`;el.style.opacity=visible?'1':'0';el.classList.toggle('active',el.dataset.node===active)})}
  function pointerDown(e){if(e.target.closest('.world-node,.scene-controls,.event-card'))return;drag=true;lastX=e.clientX;lastY=e.clientY;lastInteraction=performance.now();canvas.setPointerCapture?.(e.pointerId);canvas.classList.add('dragging')}
  function pointerMove(e){if(!drag)return;yaw-=(e.clientX-lastX)*.006;pitch=Math.max(.28,Math.min(1.18,pitch+(e.clientY-lastY)*.004));lastX=e.clientX;lastY=e.clientY}
  function pointerUp(){drag=false;canvas.classList.remove('dragging')}
  canvas.addEventListener('pointerdown',pointerDown);canvas.addEventListener('pointermove',pointerMove);canvas.addEventListener('pointerup',pointerUp);canvas.addEventListener('pointercancel',pointerUp);
  canvas.addEventListener('wheel',e=>{lastInteraction=performance.now();distance=Math.max(24,Math.min(76,distance+e.deltaY*.025));e.preventDefault()},{passive:false});
  container.querySelectorAll('[data-camera]').forEach(btn=>btn.addEventListener('click',()=>{lastInteraction=performance.now();const a=btn.dataset.camera;if(a==='left')yaw-=.32;if(a==='right')yaw+=.32;if(a==='in')distance=Math.max(24,distance-7);if(a==='out')distance=Math.min(76,distance+7);if(a==='reset'){yaw=.72;pitch=.68;distance=51;target.set(0,0,0)}}));
  let running=true,clock=new THREE.Clock();
  function animate(){if(!running)return;requestAnimationFrame(animate);syncThemeLighting();const t=clock.getElapsedTime();const positions=world.smokePoints.geometry.attributes.position;for(let i=0;i<positions.count;i++){let y=positions.getY(i)+.006;if(y>14)y=6;positions.setY(i,y)}positions.needsUpdate=true;world.movers.forEach((mover,index)=>{const range=mover.userData.train?88:76;mover.position.x=-42+((t*mover.userData.speed*4+mover.userData.offset)%range);mover.position.y=.02+Math.sin(t*1.2+index)*.015});sun.position.x=-22+Math.sin(t*.035)*8;if(!reducedMotion&&!drag&&performance.now()-lastInteraction>4200)yaw+=.00028;updateCamera();projectNodes();renderer.render(scene,camera)}
  const observer=new ResizeObserver(resize);observer.observe(container);resize();animate();
  return {
    setActive(node){active=node;const label=container.querySelector(`[data-node="${node}"] span`);const title=container.querySelector('#sceneLocation');if(title&&label)title.textContent=label.textContent},
    focus(node){const p=NODE_POSITIONS[node];if(p)target.lerp(new THREE.Vector3(p.x*.35,0,p.z*.35),.8)},
    update(metrics,nextPhase){phase=nextPhase;const env=metrics.environment/100,social=metrics.social/100;world.riverMat.color.setHSL(.52,.32,.18+env*.22);world.riverMat.opacity=.6+env*.35;world.smokeMat.opacity=Math.max(.06,(1-env)*.42);world.windowMat.emissiveIntensity=.55+metrics.market/80;scene.fog.density=.009+(1-Math.min(env,social))*.012;activeTheme='';syncThemeLighting()},
    destroy(){running=false;observer.disconnect();renderer.dispose();canvas.remove()}
  };
}
