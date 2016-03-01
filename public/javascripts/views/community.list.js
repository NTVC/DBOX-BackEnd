
dbox.controller('addListModalController', function ($scope, genericService) {
    
    $scope.community_id = null;
    $scope.list = null;
    $scope.old_scope = null;
    
    var setInitialObj = function () {
        
        $scope.old_scope = angular.copy($scope.list);
        $(addListModal).modal('show');

    };
    
    $scope.edit = function (community_id, list) {
        $scope.community_id = community_id;
        $scope.list = list;
        setInitialObj();
    };
    
    // SAVE OBJ ON THE DATABASE
    $scope.save = function () {
        
        if (validation()) {
            
            $scope.list.loader = true;
            $scope.list.save = true;
            $scope.list.thumb_file = getFileUploud(communityListThumb);
            
            if(!$scope.list.community_id)
                $scope.list.community_id = $scope.community_id;
            
            genericService.form(pathList, $scope.list, backListModalCommunity);

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

function backListModalCommunity(community) {

    var s = getScope(addListModal);

    getScope(mmgCommunityModal).getList(null);
    
    s.community_id = null;
    s.list = null;
    
    setTimeout(function () { ModelPicSize(); }, 500);

    $(addListModal).modal('hide');
    $(mmgCommunityModal).modal('show');
}