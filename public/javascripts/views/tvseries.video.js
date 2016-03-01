
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
            $scope.video.tvserie_id = $scope.list.tvserie_id;
            $scope.video.tvserie_list_id = $scope.list._id;
            
            genericService.form(pathVideo, $scope.video, backEpModaLTvSeries);

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

function backEpModaLTvSeries(data) {
    var s = getScope(addVideoModal);
    
    s.video.loader = null;
    s.$apply();
    
    getScope(mmgTvSeriesModal).bindVideoList();
    
    $(addVideoModal).modal('hide');
    $(mmgTvSeriesModal).modal('show');
}

function deleteVideo(data) {
    
    modelAlertClose();
    var sX = getScope("genericModal");
    sX.modal = null;
    
    sX.$apply();
    getScope(mmgTvSeriesModal).bindVideoList();
    
    $(mmgTvSeriesModal).modal('show');
}