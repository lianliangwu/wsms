var VersionWin = function ( editor ) {

  var container = new UI.Window("Version Viewer");


  var versionDag = new UI.DAG();
  versionDag.setOverflow('scroll');

  var sceneControlRow = new UI.Panel();

  var retrieveBtn = new UI.Button( 'Retrieve' ).setMarginLeft( '7px' ).onClick( function () {
    var versions = versionDag.getSelected();
    if(versions.length === 1){
      if(container.sceneId){
        editor.revCon.retrieve(container.sceneId, versions[0], function onEnd(err, scene){
          if(!err){
            editor.setScene(scene);
          }
        });
      }
    }else{
      alert("please select a single version.");
    }
  } );
  var commitBtn = new UI.Button( 'Commit' ).setMarginLeft( '7px' ).onClick( function () {
    
  } );
  var branchBtn = new UI.Button( 'Branch' ).setMarginLeft( '7px' ).onClick( function () {
    
  } );
  var mergeBtn = new UI.Button( 'Merge' ).setMarginLeft( '7px' ).onClick( function () {
    var versions = versionDag.getSelected();
    if(versions.length === 3){
      if(container.sceneId){
        editor.mergeWin.show(container.sceneId, versions[0], versions[1], versions[2]);
      }
    }else if(versions.length === 2){
      alert('not supported yet!');
    }else{
      alert("please select at least two versions.");
    }
  } );

  sceneControlRow.add( retrieveBtn );
  sceneControlRow.add( commitBtn );
  sceneControlRow.add( branchBtn );
  sceneControlRow.add( mergeBtn );
  sceneControlRow.setMargin("10px");
  sceneControlRow.setTextAlign('center');

  container.add( versionDag );
  container.add( sceneControlRow );
  container.setLeft("400px");
  container.hide();

  container.show = function(sceneId){
    container.dom.style.display = "";
    if(sceneId){
      this.sceneId = sceneId;
      this.loadVersions();
    }else{
      this.sceneId = editor.scene.uuid;
      this.loadVersions();
    }
  };

  container.loadVersions = function(){
    var nodes = [], edges = [];              

    //build nodes and edges array for drawing
    var build = function(versions) {

      _.each(versions, function onEach(version){
        //nodes
        nodes.push(version.versionNum);

        //edges
        var prevs = version.prevs;
        _.each(prevs, function onEach(prev){
          edges.push({
            v: version.versionNum,
            u: prev
          });
        });

      });
    };


    var formData = new FormData();  

    // Set up the request.
    var xhr = new XMLHttpRequest();

    // Open the connection.
    xhr.open('GET', 'getAllVersions?sceneId='+ this.sceneId, true);

    // Set up a handler for when the request finishes.
    xhr.onload = function () {
      if (xhr.status === 200 && xhr.readyState === 4) {

        var versions = JSON.parse(xhr.responseText).versions;

        build(versions);
        versionDag.draw(nodes, edges);     

      } else {
        alert('An error occurred!');
      }
    };

    // Send the Data.
    xhr.send(formData);
  };

  return container;
}
