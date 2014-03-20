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

function ChatViewModel(app, dataModel) {
    var self = this;

    function message(root, id, connectionId, messageBody, messageFrom, messageTime) {
        var self = this;

        self.id = id;
        self.connectionId = connectionId;
        self.messageBody = ko.observable(messageBody);
        self.messageFrom = messageFrom;
        self.messageTime = messageTime;
        self.message = messageFrom + " - " + messageTime + ": " + messageBody;
        self.messagePrefix = messageFrom + " - " + messageTime + ":";
    };

    self.addMessageBody = ko.observable("");
    self.messages = ko.observableArray();

    self.typing = ko.observable();
    self.typer = ko.observable();
    self.connectionId = ko.observable();

    self.add = function (id, messageBody, messageFrom, messageTime) {
        self.messages.push(new message(self, id, messageBody, messageFrom, messageTime));
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
        if (self.addMessageBody().length > 0)
            $.ajax({
                url: "/api/chathub/post",
                data: { 'Message': self.addMessageBody(), 'connectionId': self.connectionId() },
                type: "POST"
            });

        self.addMessageBody("");
    };

    self.onTyping = function () {
        if (self.addMessageBody().length > 6)
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
        viewModel.add(item.Id, item.Message, item.UserName, item.SentTime);
    };

    hub.client.typing = function (item) {
        viewModel.typing(item.Typing);
        viewModel.typer(item.Typer);
    };

    setInterval(function () {
        console.log("interval passed."); viewModel.typing(false);
    }, 10000);

    $.connection.hub.start().done(function () {
        var connectionId = $.connection.hub.id;
        viewModel.connectionId(connectionId);
        console.log("Connected with client id: " + connectionId);
        $('#myModal').modal('toggle');
    });

    $.get("/api/chathub/Get", function (items) {
        $.each(items, function (idx, item) {
            viewModel.add(item.ID, item.Message, item.UserName, item.SentTime);
        });
    }, "json");
});
