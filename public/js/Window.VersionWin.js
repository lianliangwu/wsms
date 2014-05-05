var VersionWin = function ( editor ) {

  var container = new UI.Window("Version Viewer");


  var versionDag = new UI.DAG();
  versionDag.setOverflow('scroll');


  var controlPanel = new UI.Panel();

  var versionControlRow = new UI.Panel();
  var retrieveBtn = new UI.Button( 'Retrieve' ).setMarginLeft( '7px' ).onClick( retrieve );
  var commitBtn = new UI.Button( 'Commit' ).setMarginLeft( '7px' ).onClick( function () {} );
  var removeBtn = new UI.Button( 'Remove' ).setMarginLeft( '7px' ).onClick( function () {} );
  
  versionControlRow.add( new UI.Text( 'Version Control' ).setWidth( '100px' ) );
  versionControlRow.add( retrieveBtn );
  versionControlRow.add( commitBtn );
  versionControlRow.add( removeBtn );
  versionControlRow.setMargin("10px");

  
  controlPanel.add(versionControlRow);

  var branchControlRow = new UI.Panel();
  var newBranchBtn = new UI.Button('New').setMarginLeft( '7px' );
  var removeBranchBtn = new UI.Button('Remove').setMarginLeft( '7px' );
  var mergeBtn = new UI.Button( 'Merge' ).setMarginLeft( '7px' ).onClick( merge );

  branchControlRow.add( new UI.Text( 'Branch Control' ).setWidth( '100px' ) );
  branchControlRow.add(newBranchBtn);
  branchControlRow.add(removeBranchBtn);
  branchControlRow.add(mergeBtn);
  branchControlRow.setMargin("10px");  

  
  controlPanel.add(branchControlRow);

  var tagControlRow = new UI.Panel();
  var newTagBtn = new UI.Button('New').setMarginLeft( '7px' );
  var removeTagBtn = new UI.Button('Remove').setMarginLeft( '7px' );

  tagControlRow.add( new UI.Text( 'Tag Control' ).setWidth( '100px' ) );
  tagControlRow.add(newTagBtn);
  tagControlRow.add(removeTagBtn);
  tagControlRow.setMargin("10px");

  
  controlPanel.add(tagControlRow);
 

  container.add( versionDag );
  container.add( controlPanel );
  container.setLeft("400px");
  container.hide();

  container.show = function(sceneId){
    container.dom.style.display = "";
    if(sceneId){
      this.sceneId = sceneId;
      drawGraph();
    }else{
      this.sceneId = editor.scene.uuid;
      drawGraph();
    }
  };

  //retrieve the selected version
  function retrieve() {
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
  }

  //merge the selected versions
  function merge() {
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
  }

  //
  function drawGraph() {
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

    var loadVersions = function() {

      var formData = new FormData();  

      // Set up the request.
      var xhr = new XMLHttpRequest();

      // Open the connection.
      xhr.open('GET', 'getAllVersions?sceneId='+ container.sceneId, true);

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

    loadVersions();
  }

  return container;
}
