var Versionwin = function ( editor ) {
  var sceneMap = {};

  var container = new UI.Window("Version Viewer");


  var sceneControlRow = new UI.Panel();
  var retrieveBtn = new UI.Button( 'Retrieve' ).setMarginLeft( '7px' ).onClick( function () {
   
  } );
  var commitBtn = new UI.Button( 'Commit' ).setMarginLeft( '7px' ).onClick( function () {
    
  } );
  var branchBtn = new UI.Button( 'Branch' ).setMarginLeft( '7px' ).onClick( function () {
    
  } );
  var mergeBtn = new UI.Button( 'Merge' ).setMarginLeft( '7px' ).onClick( function () {

  } );

  sceneControlRow.add( retrieveBtn );
  sceneControlRow.add( commitBtn );
  sceneControlRow.add( branchBtn );
  sceneControlRow.add( mergeBtn );
  sceneControlRow.setMargin("10px");
  sceneControlRow.setTextAlign('center');


  container.add( sceneControlRow );
  container.hide();


  return container;

}
