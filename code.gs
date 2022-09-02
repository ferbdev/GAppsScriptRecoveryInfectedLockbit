var folderName = '';
/** A function that delete all version of files in folder and subfolders that were made at the day of the virus attack and afterwards*/
function fixAllFilesInFolder(){ 
  var sh = SpreadsheetApp.getActiveSheet();
  var folderId = 'Your folder Id here';
  var folder = DriveApp.getFolderById(folderId); // I change the folder ID  here 
  handleFolder(folder, 0)   
}

/** A recursive function - delete all 'infected' versions of files in folder and calls itself with each of the subfolders to do the same*/
function handleFolder(folder, treeRank){
 
  Logger.log('Changing to folder: ' + folder.getName() + ' | level: ' + String(treeRank));

  fixFolderFiles(folder);
  var subFolders = folder.getFolders(); 
  while (subFolders.hasNext()){
    subFolder = subFolders.next();
    folderName = ' - ' + subFolder.getUrl();
    handleFolder(subFolder, treeRank + 1)
  }

}

/** Delete all 'infected' versions of files in folder*/
function fixFolderFiles(folder){
  var files = folder.getFiles(); 
  while (files.hasNext()){
    file = files.next();
    if(file.getName().indexOf(".lockbit")>-1){
      Logger.log('Infected File found: ' + file.getName() + folderName);
      deleteRevisions(file);
    }
    else if(file.getName()== "Restore-My-Files.txt"){
      try{
        Logger.log('Deleting contact file: ' + file.getName());
        Drive.Files.remove(file.getId(), {supportsTeamDrives:true});
      }
      catch(err){
        Logger.log(err);
      }
      
    }
  }
}

function deleteRevisions(file){
  var fileId = file.getId();  
  var revisions = Drive.Revisions.list(fileId);
  var virusDate = new Date(2022, 7, 27) /** Put your attack date here!*/
  if (revisions.items && revisions.items.length > 1) 
  {    
    for (var i = 0; i < revisions.items.length; i++) 
    {
      try
      {
        if (i > 0)
        {
          var revision = revisions.items[i];      
          var date = new Date(revision.modifiedDate);
          if(date.getTime() >= virusDate.getTime())
          {
            Logger.log('Deleting infected version: ' + date);
            Drive.Revisions.remove(fileId, revision.id);

            var fileName = file.getName().replace('.lockbit', '');
            
            file.setName(fileName);

            Logger.log('File recovered!: ' + fileName + folderName);
          }
        }  
      }
      catch(err){
        Logger.log(err);
      }     
    }  
  }
}
