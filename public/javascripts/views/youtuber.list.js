
dbox.controller('addListModalController', function ($scope, genericService) {
    
    $scope.youtuber_id = null;
    $scope.list = null;
    $scope.old_scope = null;
    
    var setInitialObj = function () {
        
        $scope.old_scope = angular.copy($scope.list);
        $(addListModal).modal('show');

    };
    
    $scope.edit = function (youtuber_id, list) {
        $scope.youtuber_id = youtuber_id;
        $scope.list = list;
        setInitialObj();
    };
    
    // SAVE OBJ ON THE DATABASE
    $scope.save = function () {
        
        if (validation()) {
            
            $scope.list.loader = true;
            $scope.list.save = true;
            $scope.list.thumb_file = getFileUploud(youtuberListThumb);
            
            if(!$scope.list.youtuber_id)
                $scope.list.youtuber_id = $scope.youtuber_id;
            
            genericService.form(pathList, $scope.list, backListModalYoutuber);

        }
    };
    
    var validation = function () {
        
        var error = '';
        $scope.list.error = null;
        
        if (isNullorEmpty($scope.list.title))
            error += errorTemplate('Title');
        if (isNullorEmpty($scope.list.status))
            error += errorTemplate('Status');
        
        if ($.trim(error) != "") {
            scrollTop();
            $scope.list.error = error;
            return false;
        }
        else
            return true;
    };
    
});

function backListModalYoutuber(youtuber) {

    var s = getScope(addListModal);

    getScope(mmgYoutuberModal).getList(null);
    
    s.youtuber_id = null;
    s.list = null;
    
    setTimeout(function () { ModelPicSize(); }, 500);

    $(addListModal).modal('hide');
    $(mmgYoutuberModal).modal('show');
}