
dbox.controller('addVideoModalController', function ($scope, genericService) {
    
    $scope.list = null;
    $scope.video = null;
    $scope.old_scope = null;
    
    $scope.edit = function (list, video) {
        $scope.list = list;
        $scope.video = video;
        $(addVideoModal).modal('show');
    };
    
    // SAVE OBJ ON THE DATABASE
    $scope.save = function () {
        
        if (validation()) {
          
            $scope.video.loader = true;
            $scope.video.save = true;
            $scope.video.youtuber_id = $scope.list.youtuber_id;
            $scope.video.youtuber_list_id = $scope.list._id;
            
            genericService.form(pathVideo, $scope.video, backEpModaLYoutuber);

        }
    };
    
    var validation = function () {
        
        var error = '';
        $scope.video.error = null;
        
        if (isNullorEmpty($scope.video.title))
            error += errorTemplate('Title');
        if (isNullorEmpty($scope.video.url))
            error += errorTemplate('Url');
        if (isNullorEmpty($scope.video.status))
            error += errorTemplate('Status');
        
        if ($.trim(error) != "") {
            scrollTop();
            $scope.video.error = error;
            return false;
        }
        else
            return true;
    };
    
});

function backEpModaLYoutuber(data) {
    var s = getScope(addVideoModal);
    
    s.video.loader = null;
    s.$apply();
    
    getScope(mmgYoutuberModal).bindVideoList();
    
    $(addVideoModal).modal('hide');
    $(mmgYoutuberModal).modal('show');
}

function deleteVideo(data) {
    
    modelAlertClose();
    var sX = getScope("genericModal");
    sX.modal = null;
    
    sX.$apply();
    getScope(mmgYoutuberModal).bindVideoList();
    
    $(mmgYoutuberModal).modal('show');
}