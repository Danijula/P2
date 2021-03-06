import {useCameraMove, updateMouseCoordinates} from './cameraMove.js';
import {usePopUpMenu, userCoordinates, cameraCoordinates} from './popUpMenu.js';
import {peers} from './PeerConnection.js';
import {clickSpinner} from "./frontend-spinner.js";

export function moveUser(id, position){
    const containerElement = document.getElementById(id);

    const userMoved = new CustomEvent('moved', {detail: position});
    containerElement.dispatchEvent(userMoved);

    containerElement.style.top  = position.top + "px";
    containerElement.style.left = position.left + "px";
}

export function turnUser(id, rotation){
    const user = document.getElementById(id + '_body');
    user.style.transform =`rotate(${rotation}rad)`;
}

export function removeDeadUser(id){
    const userElement = document.getElementById(id);
    if (userElement !== null)
        userElement.remove()

    //Close peer connection
    if (peers[id]) {
        peers[id].close();
        delete peers[id];
    }
}


export function makeInteractable(id){
    const containerElement = document.getElementById(id);
    const userElement = document.getElementById(id + '_body');
    const userDisplayElement = containerElement.querySelector(".body-display");
    const arrow = containerElement.querySelector(".arrow");
    const space = document.getElementById('space');

    userMove();
    userRotate();
    clickSpinner();
    usePopUpMenu(id);
    useCameraMove();

    return containerElement;

    // Enables the user to move around.
    function userMove() {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

        userDisplayElement.onmousedown = dragMouseDown;
        arrow.onmousedown = dragMouseDown;
        
        function dragMouseDown(e) {
            e.preventDefault();

            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragUser;
            document.onmousemove = userDrag;

            const cameramoveAllowed = new CustomEvent('cameramove', {detail: false});
            containerElement.dispatchEvent(cameramoveAllowed);

            // updates user coordinates and camera coordinates
            userCoordinates.x = containerElement.style.left, userCoordinates.y = containerElement.style.top;
            cameraCoordinates.x = space.style.left, cameraCoordinates.y =  space.style.top;
        }

        function userDrag(e) {
            e.preventDefault();

            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;

            const top  = (containerElement.offsetTop  - pos2);
            const left = (containerElement.offsetLeft - pos1);

            containerElement.style.top  = top + "px";
            containerElement.style.left = left + "px";

            const userMoved = new CustomEvent('moved', {detail: {top:top, left:left}});
            containerElement.dispatchEvent(userMoved);

            // hides popupmenu upon moving user
            const popup = document.getElementById("menuPopUp");
            popup.style.display = "none";
        }

        function closeDragUser() {
            document.onmouseup = null;
            document.onmousemove = updateMouseCoordinates;

            const cameramoveAllowed = new CustomEvent('cameramove', {detail: true});
            containerElement.dispatchEvent(cameramoveAllowed);
        }
    }
    // Enables the user to rotate
    function userRotate(){
        // User rotates when the mouse moves
        window.addEventListener("mousemove", e => lookAtMouse(e));

        function lookAtMouse(e){
            // Updates the mouse pos relative to the space div.
            let mouseX = e.clientX - space.offsetLeft;
            let mouseY = e.clientY - space.offsetTop;

            // Updates user pos from middle.
            let userX = containerElement.offsetTop - mouseY + (115/2);
            let userY = containerElement.offsetLeft - mouseX + ((115+98)/2);

            // Calculate user rotation.
            let rotation = -1 * Math.atan2(userY, userX);

            // Applies the rotation to the user.
            userElement.style.transform = "rotate(" + rotation + "rad)";

            const userRotated = new CustomEvent('turned', {detail: rotation});
            containerElement.dispatchEvent(userRotated);
        }
    }
}
