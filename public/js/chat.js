const socket = io();

//Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');

const $sendLocation = document.querySelector('#send-location');

socket.on('message', (msg) => {
    console.log(msg);
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