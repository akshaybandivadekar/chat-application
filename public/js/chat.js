const socket = io();

//Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');

const $sendLocation = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

//Templates
const messageTemplates = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true});

const autoScroll = () => {
    //New message element
    const $newMessage = $messages.lastElementChild;

    //Height of new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    //Visible Height
    const visibleHeight = $messages.offsetHeight;
    
    //Height of messages container
    const containerHeight = $messages.scrollHeight;

    //How far have I scroll?
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if(containerHeight - newMessageHeight <=  scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }

};

socket.on('message', (message) => {
    console.log(message);
    const html = Mustache.render(messageTemplates, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm:ss a')
    });
    $messages.insertAdjacentHTML('beforeend',html);
    autoScroll();
});

socket.on('locationMessage', message => {
    console.log(message);
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm:ss a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });
    document.querySelector('#sidebar').innerHTML = html;
})

$messageForm.addEventListener('submit', (e) => {
    e.stopPropagation();
    e.preventDefault();
    const message = e.target.elements.message.value;
    $messageFormButton.setAttribute('disabled','disabled');
    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();
        if(error) {
            return console.log(error)
        }
        console.log('Message delivered!')
    });
});

$sendLocation.addEventListener('click', (e) => {
    if(!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser!')
    }
    $sendLocation.setAttribute('disabled', 'disabled');
    navigator.geolocation.getCurrentPosition(position => {
        const {latitude, longitude} = position.coords;
        const locationObj = {
            latitude,
            longitude
        }
        socket.emit('sendLocation',locationObj, () => {
            $sendLocation.removeAttribute('disabled');
            console.log('Location shared!');
        });
    });
});

socket.emit('join', {username, room}, error => {
    if(error) {
        alert(error);
        location.href = '/';
    }
});