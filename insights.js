/* Descriptive photo observations only; no diagnosis or body measurements. */
(function(){
  function computeBodyMetrics(landmarks){
    const points=Array.isArray(landmarks)?landmarks:[];
    const visible=points.filter(p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&(p.visibility??1)>=.5);
    const key=[11,12,23,24,25,26,27,28];
    const keyVisible=key.filter(i=>points[i]&&(points[i].visibility??1)>=.5).length;
    const fullFrame=keyVisible>=7;
    return {
      pointCount:visible.length,
      categories:[
        {name:'Image observations',items:[
          {val:String(visible.length)+' / '+points.length,label:'Landmarks visible to the model'},
          {val:String(keyVisible)+' / '+key.length,label:'Shoulder, hip, knee and ankle landmarks visible'},
          {val:fullFrame?'Full view':'Partial view',label:'Key points in this photo'}
        ]}
      ],
      focusAreas:fullFrame
        ? ['Use this as a photo check-in, not a posture assessment','Discuss any movement concerns with your physiotherapist']
        : ['Try a full-length photo with even light for a clearer view','Discuss any movement concerns with your physiotherapist']
    };
  }
  window.FebfitInsights={computeBodyMetrics};
})();
