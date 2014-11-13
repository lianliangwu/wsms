var VersionWin = function ( editor ) {

  var container = new UI.Window("Version History");
  container.setInnerWidth("300px");
  container.setInnerHeight("300px");


  var versionDag = new UI.DAG();
  versionDag.setOverflow('scroll');

  var controlPanel = new UI.Panel();

  // version control
  var versionControlRow = new UI.Panel();
  var retrieveBtn = new UI.Button( 'Checkout' ).setMarginRight( '20px' ).onClick( retrieve );
  // var commitBtn = new UI.Button( 'Commit' ).setMarginLeft( '7px' ).onClick( function () {} );
  // var removeBtn = new UI.Button( 'Remove' ).setMarginLeft( '7px' ).onClick( removeVersion );
  
  // versionControlRow.add( new UI.Text( 'Version :' ).setWidth( '100px' ) );
  versionControlRow.add( retrieveBtn );
  // versionControlRow.add( commitBtn );
  // versionControlRow.add( removeBtn );
  // versionControlRow.setMargin("10px");
  versionControlRow.setTextAlign("right");  
  
  controlPanel.add(versionControlRow);

  //branch control
  // var branchControlRow = new UI.Panel();
  // var newBranchBtn = new UI.Button('New').setMarginLeft( '7px' );
  // var removeBranchBtn = new UI.Button('Remove').setMarginLeft( '7px' );
  // var mergeBtn = new UI.Button( 'Merge' ).setMarginLeft( '7px' ).onClick( merge );

  // branchControlRow.add( new UI.Text( 'Branch :' ).setWidth( '100px' ) );
  // branchControlRow.add(newBranchBtn);
  // branchControlRow.add(removeBranchBtn);
  // branchControlRow.add(mergeBtn);
  // branchControlRow.setMargin("10px");  

  // controlPanel.add(branchControlRow);

  //tag control
  // var tagControlRow = new UI.Panel();
  // var newTagBtn = new UI.Button('New').setMarginLeft( '7px' );
  // var removeTagBtn = new UI.Button('Remove').setMarginLeft( '7px' );

  // tagControlRow.add( new UI.Text( 'Tag :' ).setWidth( '100px' ) );
  // tagControlRow.add(newTagBtn);
  // tagControlRow.add(removeTagBtn);
  // tagControlRow.setMargin("10px");

  
  // controlPanel.add(tagControlRow);
 

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
      // alert('not supported yet!');
      if(container.sceneId){
        editor.mergeWin.show(container.sceneId, versions[0], versions[1]);
      }
    }else{
      alert("please select at least two versions.");
    }
  }

  //remove the selected version
  function removeVersion () {
    var versions = versionDag.getSelected();
    if(versions.length === 1){
      if(container.sceneId){
        editor.revCon.removeVersion({
          'versionNum': versions[0]
        }, function onEnd(err, result) {
          if(!err){
            if(result.success === true){
              alert('remove success.');
            }
          }
        });
      }
    }else{
      alert("please select only one version.");
    }
  }

  //draw version history graph
  function drawGraph() {

    var loadVersions = function() {

      var formData = new FormData();  

      // Set up the request.
      var xhr = new XMLHttpRequest();

      // Open the connection.
      xhr.open('GET', 'getRHG?sceneId='+ container.sceneId, true);

      // Set up a handler for when the request finishes.
      xhr.onload = function () {
        if (xhr.status === 200 && xhr.readyState === 4) {
          var result = JSON.parse(xhr.responseText);
          var nodes = result.nodes;
          var edges = result.edges;

          //get state arrays
          var states = nodes.map(function(node) {
            var state = {};
            state.id = node.id;
            state.color = "#fff";
            state.value = {};
            state.value.label = node.label;      
            
            if(node.tags){
              state.value.label += '\ntag: [ ';

              _.each(node.tags, function onEach(tag, i){
                if(i>0){
                  state.value.label +=',';
                }
                state.value.label += tag;
              });

              state.value.label += ' ]';
              state.color = "#00FFFF";
            }

            return state;
          });

          _.each(nodes, function onEach(node) {
            if (node.branches){
              _.each(node.branches, function onEach(branch) {
                // branch node
                var state = {};
                state.id = branch.name;
                state.color = "#FFD800";
                state.value = {};
                state.value.label = 'branch: [' + branch.name + ']';
                if (branch.privilege === 'private') {
                  state.value.label += ', ' + branch.creator;
                }else{
                  state.value.label += ', ' + branch.privilege;
                }

                states.push(state);

                // edge
                var edge = {
                  'v': branch.name,
                  'u': node.id
                };
                edges.push(edge);
              });
            }
          });

          versionDag.draw(states, edges);
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
