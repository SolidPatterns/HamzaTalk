//function ChatViewModel(app, dataModel) {
//    var self = this;

//    // ChatViewModel currently does not require data binding, so there are no visible members.
//}

//app.addViewModel({
//    name: "Chat",
//    bindingMemberName: "chat",
//    factory: ChatViewModel
//});

$(document).ready(function () {
    $('#myModal').modal('toggle');
});

$(function () {

    $("textarea[maxlength]").bind('input propertychange', function () {
        var maxLength = $(this).attr('maxlength');
        if ($(this).val().length > maxLength) {
            $(this).val($(this).val().substring(0, maxLength));
        }
    });
});

function updateScroll() {
    var element = document.getElementById("chatDiv");
    element.scrollTop = element.scrollHeight;
}

function ChatViewModel() {
    var self = this;

    function message(root, id, connectionId, messageBody, messageFrom, messageTime, showName) {
        var _self = this;

        _self.id = id;
        _self.connectionId = connectionId;
        _self.messageBody = ko.observable(messageBody);
        _self.messageFrom = messageFrom;
        _self.messageTime = messageTime;
        _self.message = messageFrom + " - " + messageTime + ": " + messageBody;
        _self.messagePrefix = messageFrom + " - " + messageTime + ":";
        _self.isOwnMessage = ko.observable(messageFrom.toString() == self.userName().toString());
        _self.showName = ko.observable(showName && !_self.isOwnMessage());

        _self.messageClass = ko.computed(function () {
            return _self.isOwnMessage() == true ? "alert-warning pull-right" : "alert-info pull-left";
        }, _self);
    };

    self.addMessageBody = ko.observable("");
    self.messages = ko.observableArray();
    self.userName = ko.observable();
    self.typing = ko.observable();
    self.typer = ko.observable();
    self.connectionId = ko.observable();

    self.wasPreviousOwn = ko.observable(false);

    self.add = function (id, connectionId, messageBody, messageFrom, messageTime, showName) {
        self.messages.push(new message(self, id, connectionId, messageBody, messageFrom, messageTime, showName));
        updateScroll();
    };

    ko.bindingHandlers.returnAction = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var value = ko.utils.unwrapObservable(valueAccessor());

            $(element).keydown(function (e) {
                if (e.which === 13) {
                    e.preventDefault();
                    value(viewModel);
                }
            });
        }
    };

    self.sendMessage = function () {
        if (self.addMessageBody().length > 0) {
            $.post('api/chathub', { 'Message': self.addMessageBody(), 'ConnectionId': self.connectionId() });

            self.addMessageBody("");
        }
    };

    self.onTyping = function () {
        if (self.addMessageBody().length >= 6 && self.addMessageBody().length % 6 == 0)
            $.ajax({
                url: "api/chat/broadcastTyping/" + self.connectionId(),
                type: "POST"
            });
    };
}

$(function () {

    var viewModel = new ChatViewModel(),
        hub = $.connection.chat;

    ko.applyBindings(viewModel);

    hub.client.addItem = function (item) {
        viewModel.add(item.Id, item.ConnectionId, item.Message, item.UserName, item.SentTime, item.ShowName);
    };

    hub.client.typing = function (item) {
        viewModel.typing(item.Typing);
        viewModel.typer(item.Typer);
    };

    setInterval(function () {
        console.log("interval passed.");
        viewModel.typing(false);
    }, 10000);

    $.connection.hub.start().done(function () {
        var connectionId = $.connection.hub.id;
        viewModel.connectionId(connectionId);
        console.log("Connected with client id: " + connectionId);
        $('#myModal').modal('toggle');
    });

    $.get("/api/chat/GetUserName", function (item) {
        viewModel.userName(item);
    }, "json");

    $.get("/api/chathub/Get", function (items) {
        $.each(items, function (idx, item) {
            viewModel.add(item.Id, item.ConnectionId, item.Message, item.UserName, item.SentTime, item.ShowName);
        });
    }, "json");
});
