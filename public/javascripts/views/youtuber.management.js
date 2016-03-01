
dbox.controller('mmgYoutuberModalController', function ($scope, genericService) {
    
    $scope.youtuber = null;
    $scope.list = null;
    $scope.limits = getShowLimit();
    
    $scope.filter = {
        search: '',
        status: '1',
        pg: {
            index: 0, 
            limit: '10',
            range: 0,
            total: 0
        }
    }
      
    var getFilter = function (isCounter) {
        
        var filter = {};
        
        filter = angular.copy($scope.filter);
        filter.getList = true;
        filter.youtuber_id = $scope.youtuber._id;
        
        if (isCounter) {
            filter.count = true;
        }
        else {
            filter.pg_index = $scope.filter.pg.index;
            filter.pg_limit = $scope.filter.pg.limit;
        }
        
        return filter;

    }
      
     /*##############################################################*/
    // LIST FUNCTIONS 
    
    // GET ARRAY OF COMMUNITY BY ID
    $scope.getList = function(youtuber){
        
        if(youtuber)
            $scope.youtuber = youtuber;
        
        genericService.handler(pathList, getFilter(false)).then(function (data) {
            if (checkMessage(data)) {
                $scope.list = data;
                
                // GET FOR THE FIRST OBJECT, THE LIST OF VIDEOS
                if($scope.list.length > 0){
                    var obj = $scope.list[0];
                    obj.isShowed = true;
                    
                    $scope.getVideos(obj);
                }
            }
        });
        
        // GET NUMBER OF DATA ON THE BASE
        genericService.handler(pathList, getFilter(true)).then(function (data) {

            $scope.filter.pg.total = data;
            $scope.filter.pg = preparePagination($scope.filter.pg);
        });
    };
    
    $scope.search = function(){
        $scope.getList();
    };
    
    // EDIT LIST
    $scope.edit_list = function (list) {
        $(mmgYoutuberModal).modal('hide');
        getScope(addListModal).edit($scope.youtuber._id, list);
    }
    
    // DELETE LIST
    $scope.delete_list = function (list) {
        
        var modal = {};
        
        modal.title = 'Delete List';
        modal.button_class = 'danger';
        modal.button_label = 'Delete';
        modal.body = 'Do you really want to remove the list <b>' + list.title + '</b>?';
        modal.invoke = 'deleteList';
        
        modal.obj = list;
        
        setMainModal(modal);
    };
    /*##############################################################*/
    // END LIST FUNCTIONS 
    
    /*##############################################################*/
    // VIDEOS FUNCTIONS 
    
       
    var getFilterVideo = function (isCounter, list) {
        
        var filter = angular.copy(list.filter);
           
        if (isCounter) {
            filter.count = true;
        }
        else{
            filter.count = false;
            
            filter.pg_index = list.filter.pg.index;
            filter.pg_limit = list.filter.pg.limit;
        }
        
        return filter;

    }
    
    // EDIT VIDEO
    $scope.edit_video = function (list, video) {
        $(mmgYoutuberModal).modal('hide');
        getScope(addVideoModal).edit(list, video);
    }
    
    // DELETE VIDEO
    $scope.delete_video = function (list, video) {
        
        var modal = {};
        
        modal.title = 'Delete Video';
        modal.button_class = 'danger';
        modal.button_label = 'Delete';
        modal.body = 'Do you really want to remove the video <b>' + video.title + '</b>?';
        modal.invoke = 'deleteVideo';
        
        modal.obj = video;
        
        setMainModal(modal);
    };
    
    $scope.getBasicFilter = function(list){
         
         if(!list.filter){
            list.filter =  {
                search: '',
                status: '1',
                pg: {
                    index: 0, 
                    limit: '10',
                    range: 0,
                    total: 0
                },
                youtuber_id :list.youtuber_id,
                youtuber_list_id : list._id,
                getVideo: true
            };   
         }
        
        return list;
    }
    
    
    $scope.getVideosResearch = function(list){
      
       list.filter.pg.index = 0;
       $scope.getVideos(list);   
    };
    // GET ALL VIDEOS RELATED WITH A LIST
    $scope.getVideos = function(list){
        
        if(list.isShowed){
            list.videos = null;
            list = list.filter == undefined ? $scope.getBasicFilter(list) : list;
            
            genericService.handler(pathVideo, getFilterVideo(false, list)).then(function (data) {
                if (checkMessage(data)) {
                    list.videos = data;
                }
            });
            // GET NUMBER OF DATA ON THE BASE
            genericService.handler(pathVideo, getFilterVideo(true, list)).then(function (data) {
                
                list.filter.pg.total = data;
                list.filter.pg = preparePagination(list.filter.pg);
            });
        }
    };
    
    $scope.bindVideoList = function(){
        
        $scope.list.forEach(function(elem) {
            if(elem.isShowed){
                $scope.getVideos(elem);
            }
        });
        
    };
    
    
    /*##############################################################*/
    // END VIDEOS FUNCTIONS 
    
});

