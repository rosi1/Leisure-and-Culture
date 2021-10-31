'use strict';

const domain = "http://localhost:8080";


function checkIfAuth() {
    if(!localStorage.getItem('token')) {
        window.location.href = ("../");
    }
}

function onLogOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
}

function gameChosen(gameUrl) {
    window.location.href = gameUrl;
}


async function registerForm($form) {

    var formData = new Object();
    formData.firstname = $form[0].value;
    formData.lastname = $form[1].value;
    formData.email = $form[2].value;
    formData.password = $form[3].value;
    
    var jsonString = JSON.stringify(formData);

    console.log(jsonString);

    $.ajax({
        url : domain + "/register",
        type: "POST",
        headers: { 'Content-Type': 'application/json' },
        data: jsonString,
        success: function(res)
        {
            window.location.href = './signin.html'; 
            return true;
        },
        error: function(xhr, status, error){
            var errorMessage = xhr.status + ': ' + xhr.statusText + ' - '+ xhr.responseText;
            console.log('Error - ' + errorMessage);
            const failure = document.querySelector('#failure');
            failure.style.display="block";
            failure.innerText = xhr.responseText;
            return false;
        }
    });

}

async function logInFlow($form) {
    var formData = new Object();
    formData.email = $form[0].value;
    formData.password = $form[1].value;
    var jsonString = JSON.stringify(formData);

    console.log("log in data: " + jsonString);

    $.ajax({
        url : domain + "/login",
        type: "POST",
        headers: { 'Content-Type': 'application/json' },
        data: jsonString,
        success: function(res)
        {
                localStorage.setItem('token', res);
                //console.log("Token received: " + res);
                localStorage.setItem('userEmail', formData.email);
                window.location.href = './index.html';  
                return true;
        },
        error: function(xhr, status, error){
            var errorMessage = xhr.status + ': ' + xhr.statusText + ' - '+ xhr.responseText;
            console.log('Error - ' + errorMessage);
            const failure = document.querySelector('#failure');
            failure.style.display="block";
            failure.innerText = xhr.responseText;
            return false;
        }
    });
}

//ENTRANCE PAGE

function onEntrance() {

    //INFO
    const inf = document.querySelector('.inf');
    inf.style.display = "none";
    inf.innerText = `Welcome to Leisure culture!\n The first site that combines info about several types of leisure.
    To start you will have to sign up, hope you'll enjoy it!`

    const info = document.querySelector('.info');
    info.style.cursor= 'help';
        info.onmouseenter = function(e) {
        if (inf.style.display === 'none') {
            inf.style.display = 'block';
            inf.style.position= 'absolute';
            inf.style.left="100px";
            inf.style.top= "6%";
        }

    }
    info.onmouseleave = function(e) {
        if (inf.style.display === 'block') {
            inf.style.display = 'none';
        }
    }

    //page center
    const bodyDiv = document.createElement('div')
    bodyDiv.setAttribute('class', 'text-center my-2');

    const a = document.createElement('a');
    a.setAttribute('class', 'h4');
    a.innerHTML = "sign up";
    a.href = "./html/signup.html";
    a.style.position = 'relative';

    const logo = document.createElement('img');
    logo.setAttribute('class', 'logo img-fluid');
    logo.src = "./img/brain2.png";
    logo.style.position = 'relative';
    logo.style.opacity = '0.8';

    const a2 = document.createElement('a');
    a2.setAttribute('class', 'h4');
    a2.innerHTML = "sign in";
    a2.href = "./html/signin.html";
    a2.style.position = 'relative';

    bodyDiv.append(a);
    bodyDiv.append(logo);
    bodyDiv.append(a2);

    document.body.appendChild(bodyDiv);

    const head1 = document.querySelector('.h1');
    head1.innerHTML = `Leisure <span style="color: rgb(245, 150, 166)">culture</span>`
}

//INDEX
function inIndex() {
    $(function () {
        $("#nav-placeholder").load("./navbar.html");
    });

    const elContent = document.getElementById('content-index');

    const categories = [{
        type: 'Books',
        imageSrc: '../img/psycho_books.png',
        imageLink: './books.html'
    }, {
        type: 'Movies',
        imageSrc: '../img/psycho_movies.png',
        imageLink: './movies.html'
    }, {
        type: 'Games',
        imageSrc: '../img/psycho_games.png',
        imageLink: './games.html'
    }]

    const createElement = (categories) => {
        const categoryEl = document.createElement('div');
        categoryEl.setAttribute('class', 'col');
        //console.log(categoryEl);

        const categoryImg = document.createElement('img');
        categoryImg.setAttribute('class', 'img-fluid');
        categoryImg.setAttribute('src', categories.imageSrc);
        categoryImg.setAttribute('id', categories.type);

        categoryImg.onclick = function() {
            window.location.href = categories.imageLink;
        }
        categoryImg.style.cursor = 'pointer';
        categoryImg.style.height = '400px';
        categoryImg.style.width = '350px';

        categoryEl.append(categoryImg);
        return categoryEl;
    }

    for (let i = 0; i < categories.length; i++) {
        elContent.append(createElement(categories[i]));
    }
};


//favorites page
function onFavorites() {
  
    $(function () {
        $("#nav-placeholder").load("./navbar.html");
    });

    $.ajax({
        url : domain + "/favorite",
        type: "GET",
        headers: { 'email': localStorage.getItem("userEmail"), 'x-access-token': localStorage.getItem("token"), 'activity': 'books' },
        dataType: 'json',
        success: function(res)
        {
            if( res.length == 0 ) {
                return;
            }

            $('#noFavsBooks').remove();

            var bookFavs = document.getElementById("booksPlaceHolder");


            res.forEach((key) => {
                bookFavs.innerHTML += `<li style= 'cursor:pointer' onclick='openBook(${key.id})' > ${key.title} </li>`;
            });

            // document.getElementById("noFavsBooks").value += `${res.firstname}`;
            // document.getElementById("profileLastName").value = res.lastname;
            // document.getElementById("phoneNumber").value = res.phone;
            // document.getElementById("emailAddress").value = email;
        },
        error: function(xhr, status, error){
            var errorMessage = xhr.status + ': ' + xhr.statusText + ' - '+ xhr.responseText;
            console.log('Error - ' + errorMessage);
        }
    });

    $.ajax({
        url : domain + "/favorite",
        type: "GET",
        headers: { 'email': localStorage.getItem("userEmail"), 'x-access-token': localStorage.getItem("token"), 'activity': 'movies' },
        dataType: 'json',
        success: function(res)
        {
            if( res.length == 0 ) {
                return;
            }

            $('#noFavsMovies').remove();

            var moviesFavs = document.getElementById("moviesPlaceHolder");

            res.forEach((key2) => {
                moviesFavs.innerHTML += `<li style= 'cursor:pointer' onclick='openMovie(${key2.id})' > ${key2.title} </li>`;
            });

            // document.getElementById("noFavsBooks").value += `${res.firstname}`;
            // document.getElementById("profileLastName").value = res.lastname;
            // document.getElementById("phoneNumber").value = res.phone;
            // document.getElementById("emailAddress").value = email;
        },
        error: function(xhr, status, error){
            var errorMessage = xhr.status + ': ' + xhr.statusText + ' - '+ xhr.responseText;
            console.log('Error - ' + errorMessage);
        }
    });
}

//adding to favorites
function addToFavs(category, id) {

    var formData = new Object();
    formData.email = localStorage.getItem("userEmail");
    formData.activity = category;
    formData.id = id;
    
    var jsonString = JSON.stringify(formData);

    console.log(jsonString);

    $.ajax({
        url : domain + "/favorite/update",
        type: "POST",
        headers: { 'Content-Type': 'application/json', 'x-access-token': localStorage.getItem("token") },
        //dataType: 'json',
        data: jsonString,
        success: function(res)
        {
            console.log("Successfully added to favorites");
            return true;
        },
        error: function(xhr, status, error){
            var errorMessage = xhr.status + ': ' + xhr.statusText + ' - '+ xhr.responseText;
            console.log('Error - ' + errorMessage);
            return false;
        }
    });
}

//removing from favorites
function removeFromFavs(category, id) {

    var formData = new Object();
    formData.email = localStorage.getItem("userEmail");
    formData.activity = category;
    formData.id = id;
    
    var jsonString = JSON.stringify(formData);

    console.log(jsonString);

    $.ajax({
        url : domain + "/favorite/delete",
        type: "DELETE",
        headers: { 'Content-Type': 'application/json', 'x-access-token': localStorage.getItem("token") },
        //dataType: 'json',
        data: jsonString,
        success: function(res)
        {
            console.log("Successfully deleted from favorites");
            return true;
        },
        error: function(xhr, status, error){
            var errorMessage = xhr.status + ': ' + xhr.statusText + ' - '+ xhr.responseText;
            console.log('Error - ' + errorMessage);
            return false;
        }
    });
}



function getProfile() {

    checkIfAuth();

    $(function () {
        $("#nav-placeholder").load("./navbar.html");
    });

    var token = localStorage.getItem('token');
    console.log("token: " + token);

    var email = localStorage.getItem('userEmail');
    console.log("email: " + email);

    $.ajax({
        url : domain + "/profile",
        type: "GET",
        headers: { 'email': email, 'x-access-token': token },
        dataType: 'json',
        success: function(res)
        {
            document.getElementById("profileName").value += `${res.firstname}`;
            document.getElementById("profileLastName").value = res.lastname;
            document.getElementById("phoneNumber").value = res.phone;
            document.getElementById("emailAddress").value = email;
        },
        error: function(xhr, status, error){
            var errorMessage = xhr.status + ': ' + xhr.statusText + ' - '+ xhr.responseText;
            console.log('Error - ' + errorMessage);
        }
    });

    $.ajax({
        url : domain + "/profile-pic",
        type: "GET",
        headers: { 'email': email, 'x-access-token': token },
        xhrFields:{
            responseType: 'blob'
        },
        success: function(res)
        {
            const img = document.querySelector('#photo');
            var url = window.URL || window.webkitURL;
            img.src = url.createObjectURL(res);

        },
        error: function(xhr, status, error){
            var errorMessage = xhr.status + ': ' + xhr.statusText + ' - '+ xhr.responseText;
            console.log('Error - ' + errorMessage);
        }
    });

    //profile image

const imgDiv = document.querySelector('.profile-pic-div');
const img = document.querySelector('#photo');
const file1 = document.querySelector('#file');
const uploadBtn = document.querySelector('#uploadBtn');


file1.addEventListener('change', function(){
    const choosedFile = this.files[0];
    if(choosedFile){
        const reader = new FileReader();

        reader.addEventListener('load', function(){
            img.setAttribute('src', reader.result);
            let formData = new FormData();
            formData.append('profile_pic', choosedFile);
            $.ajax({
                url: '/upload-profile-pic',
                type: 'post',
                headers: { 'email': localStorage.getItem("userEmail"), "x-access-token": localStorage.getItem("token") },
                dataType: 'multipart/form-data',
                data: formData,
                processData: false,
                contentType: false,
                success: function(image)
                {
                    console.log("success");
                }
            });
        });
        reader.readAsDataURL(choosedFile);

    }
})
}

function sendProfile($form) {

    var formData = new Object();
    formData.email = localStorage.getItem("userEmail");
    formData.firstname = $form[1].value;
    formData.lastname = $form[2].value;
    formData.phone = $form[4].value;
    var jsonString = JSON.stringify(formData);

    console.log("profile new data: " + jsonString);

    $.ajax({
        url : domain + "/profile/update",
        type: "POST",
        headers: { 'Content-Type': 'application/json', "x-access-token": localStorage.getItem("token") },
        //dataType: 'json',
        data: jsonString,
        success: function(res)
        {
                console.log("Profile updated");
                return true;
        },
        error: function(xhr, status, error){
            console.log("Profile update failed!");
            var errorMessage = xhr.status + ': ' + xhr.statusText + ' - '+ xhr.responseText;
            console.log('Error - ' + errorMessage);
            return false;
        }
    });

}



function fetchBooks(category) {
    
    // temporary saving the category to local storage
    localStorage.setItem('category', category);
    window.location.href = "./show.html";

}


function parseBooks(item, index) {
    console.log("item" + item);
    const { id, title, author, year, summary, imagePath } = item;

    var completelist= document.querySelector(".img-area")

    completelist.innerHTML += `<div class=single-img><img id="images" src=${item.imagePath}  onmouseover="this.src='../img/check.jpg'" onmouseout="this.src='${item.imagePath}'" onclick='openBook(${id})'></div>`

}
function openBook(bookId) {

    localStorage.setItem("bookId", bookId);
    var win = window.open("book-info.html", "Title", "toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes, resizable=yes,top="+(screen.height-400)+",left="+(screen.width-100));
    win.resizeTo(800,1100)
}






function updateRanking(activity, id, grade) {

    $.ajax({
        url : domain + "/ranking",
        type: "POST",
        headers: { 'x-access-token': localStorage.getItem("token"), 'email': localStorage.getItem("userEmail"), 'activity':  activity, 'id': id, 'grade': grade},
        //dataType: 'json',
        //data: jsonString,
        success: function(res)
        {
            console.log("Successfully added to ranking");
            return true;
        },
        error: function(xhr, status, error){
            var errorMessage = xhr.status + ': ' + xhr.statusText + ' - '+ xhr.responseText;
            console.log('Error - ' + errorMessage);
            return false;
        }
    });
}

function updateReview(activity, id, rev) {


    $.ajax({
        url : domain + "/review",
        type: "POST",
        headers: { 'x-access-token': localStorage.getItem("token"), 'email': localStorage.getItem("userEmail"), 'activity':  activity, 'id': id, myReview: rev},
        //dataType: 'json',
        // data: jsonString,
        success: function(res)
        {
            console.log("Successfully added to reviews");
            return true;
        },
        error: function(xhr, status, error){
            var errorMessage = xhr.status + ': ' + xhr.statusText + ' - '+ xhr.responseText;
            console.log('Error - ' + errorMessage);
            return false;
        }
    });
}


function fetchMovies(genre) {
    
    console.log("genre chosen: " + genre);
    
    // temporary saving the category to local storage
    localStorage.setItem('genre', genre);
    console.log("genre received: " + genre);
    window.location.href = "./showMovies.html";

}




function parseMovies(item, index) {
    console.log(item);
    const { id, trailerUrl } = item;

    var completelist = document.getElementById("innerContainer");

    const div = document.createElement('div');
    div.setAttribute('class','col')
    const h2 = document.createElement('h2');
    h2.innerText = item.title;
    h2.style.cursor = "pointer";
    h2.setAttribute('onclick', `openMovie(${id})`);
      
    div.appendChild(h2);

    const innerdiv = document.createElement('div');
    innerdiv.setAttribute('id', 'trailer');
    var obj = {
        "video": {
            "value": "<iframe title='YouTube video player' type=\"text/html\" width='500' height='305' src='" + trailerUrl + "' frameborder='0' allowFullScreen></iframe>"
        }
    }
    innerdiv.innerHTML = obj.video.value;
    div.appendChild(innerdiv);
    completelist.appendChild(div);

}
function openMovie(movieId) {

    localStorage.setItem("movieId", movieId);
    var win = window.open("movie-info.html", "Title", "toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes, resizable=yes,top="+(screen.height-300)+",left="+(screen.width-100));
    win.resizeTo(800,1100);
}


//book info
function onShowBook() {
    var bookId = localStorage.getItem('bookId');
    console.log("bookId: " + bookId);
  
    $.ajax({
        url : domain + "/book",
        type: "GET",
        headers: { 'id': bookId, 'x-access-token': localStorage.getItem("token"), 'email': localStorage.getItem("userEmail") },
        dataType: 'json',
        success: function(res)
        {
            let { title, author, year, category, userRanking, totalRanking, userReview, summary, imagePath, favorite, reviews } = res;
            const bodyDiv = document.getElementById('firstDiv')
            bodyDiv.setAttribute('class', 'container text-center my-2');
            const divTitle = document.createElement('h1');
            divTitle.innerHTML = `${title}`;
            divTitle.style.textDecorationLine="underline";
            bodyDiv.append(divTitle);

            bodyDiv.innerHTML += "<br> Year: " + year; 
            bodyDiv.innerHTML += "<br> Author: " + author; 
            bodyDiv.innerHTML += "<br> Category: " + category; 
            bodyDiv.innerHTML += "<br> Description: " + summary; 
            bodyDiv.innerHTML += "<br> <br>"; 

            if(totalRanking){
                if(totalRanking >= 4) {
                    bodyDiv.innerHTML += `average ranking: ${totalRanking }😍`; 
                }else if(totalRanking > 2){
                    bodyDiv.innerHTML += `average ranking: ${totalRanking }😐`; 
                }else{
                    bodyDiv.innerHTML += `average ranking: ${totalRanking }😭`; 
                }
            }else{
                bodyDiv.innerHTML += `no rankings yet 😥`; 
            }
            bodyDiv.innerHTML += ` <div class="rate"><input type="radio" id="star5" name="rate" value="5" onclick="updateRanking('books', ${bookId}, '5')"/>
                                    <label for="star5" title="text">5 stars</label>
                                                    <input type="radio" id="star4" name="rate" value="4" onclick="updateRanking('books', ${bookId}, '4')"/>
                                                    <label for="star4" title="text">4 stars</label>
                                                    <input type="radio" id="star3" name="rate" value="3" onclick="updateRanking('books', ${bookId}, '3')"/>
                                                    <label for="star3" title="text">3 stars</label>
                                                    <input type="radio" id="star2" name="rate" value="2" onclick="updateRanking('books', ${bookId}, '2')"/>
                                                    <label for="star2" title="text">2 stars</label>
                                                    <input type="radio" id="star1" name="rate" value="1" onclick="updateRanking('books', ${bookId}, '1')"/>
                                                    <label for="star1" title="text">1 star</label>
                                </div>`;

            const i= document.getElementById('unique');
            const hearts = document.getElementById('hearts');
            

            if(favorite == "false") {
                i.style.color = "rgb(206, 202, 202)";
                i.onclick = function(){
                    addToFavs('books', bookId);
                    i.style.color = "red";
                    hearts.style.visibility="visible";
                    return true;
                  };
            } else {
                i.style.color = "red";
                i.onclick = function(){
                    removeFromFavs('books', bookId);
                    i.style.color = "rgb(206, 202, 202)";
                    brokenHearts.style.visibility = "visible";
                    return true;
                  };
            }

            if (!userRanking) {
            } else if (userRanking == '1') {
                document.getElementById("star1").checked = true;
            } else if (userRanking == '2') {
                document.getElementById("star2").checked = true;
            } else if (userRanking == '3') {
                document.getElementById("star3").checked = true;
            } else if (userRanking == '4') {
                document.getElementById("star4").checked = true;
            } else if (userRanking == '5') {
                document.getElementById("star5").checked = true;
            }

            //heart button
            $(function () {
                $("i").click(function () {
                    $("i,span").toggleClass("press", 1000);
                });
            });

            //carousel
            var lis = document.getElementById("carouselLis");
            for (let i = 0; i < reviews.length; i++) {
                const li = document.createElement('li');
                li.setAttribute('data-target', '#myCarousel');
                li.setAttribute('data-slide-to', i);
                if(i == 0) {
                    li.setAttribute('class', 'active');
                }
                lis.appendChild(li);
              }

              var innerList = document.getElementById("carouselInner");
              for (let i = 0; i < reviews.length; i++) {
                  const div = document.createElement('div');
                  if(i == 0) {
                    div.setAttribute('class', 'item active');
                  } else {
                    div.setAttribute('class', 'item');
                  }
                  const p = document.createElement('p');
                  p.innerText = reviews[i].desc;
                  div.appendChild(p);
                  const h5 = document.createElement('h5');
                  h5.innerText = reviews[i].name;
                  div.appendChild(h5);
                  innerList.appendChild(div);
                }
                
                //own review
                var self = document.getElementById("selfReview");
                const text = document.createElement('textarea');
                text.style.fontSize="16px";
                text.placeholder="Pls type here your review...";
                text.cols="30";
                text.rows="5";
                self.appendChild(text);
                if(userReview) {
                    text.value = userReview;
                }

                const but = document.createElement('button');
                but.style.background="url(../img/send.png)";
               
                but.onclick = function() {
                    updateReview('books', bookId, text.value);
                    but.style.background="url(../img/sent.png)";
                }

                self.appendChild(but);
        },
        error: function(xhr, status, error){
            var errorMessage = xhr.status + ': ' + xhr.statusText + ' - '+ xhr.responseText;
            console.log('Error - ' + errorMessage);
        }
    });
}

async function onShowBooks() {

    var category = localStorage.getItem('category');
    // console.log("category: " + category);

    var token = localStorage.getItem('token');
    // console.log("token: " + token);
    $.ajax({
        url : domain + "/books",
        type: "GET",
        headers: { 'category': category, 'x-access-token': token },
        dataType: 'json',
        success: function(res)
        {
            document.querySelector('h1').innerHTML= category;
            res.forEach(parseBooks);
        },
        error: function(xhr, status, error){
            var errorMessage = xhr.status + ': ' + xhr.statusText + ' - '+ xhr.responseText;
            console.log('Error - ' + errorMessage);
        }
    });
} 


//movie info
function onShowMovie() {
    var movieId = localStorage.getItem('movieId');
    console.log("movieId: " + movieId);
  
    $.ajax({
        url : domain + "/movie",
        type: "GET",
        headers: { 'id': movieId, 'x-access-token': localStorage.getItem("token"), 'email': localStorage.getItem("userEmail") },
        dataType: 'json',
        success: function(res)
        {
            let { title, director, year, genre, userRanking, totalRanking, userReview, plot, trailerUrl, favorite, reviews } = res;

            //const bodyDiv = document.createElement('div')
            const bodyDiv = document.getElementById('firstDiv')
            bodyDiv.setAttribute('class', 'container text-center my-2');

            const divTitle = document.createElement('h1');
            divTitle.innerHTML = `${title}`;
            divTitle.style.textDecorationLine="underline";
            bodyDiv.append(divTitle);

            bodyDiv.innerHTML += "<br> Year: " + year; 
            bodyDiv.innerHTML += "<br> Director: " + director; 
            bodyDiv.innerHTML += "<br> Genre: " + genre; 
            bodyDiv.innerHTML += "<br> Plot: " + plot; 
            bodyDiv.innerHTML += "<br> <br>"; 

        
            if(totalRanking){
                if(totalRanking >= 4) {
                    bodyDiv.innerHTML += `average ranking: ${totalRanking }😍`; 
                }else if(totalRanking > 2){
                    bodyDiv.innerHTML += `average ranking: ${totalRanking }😐`; 
                }else{
                    bodyDiv.innerHTML += `average ranking: ${totalRanking }😭`; 
                }
            }else{
                bodyDiv.innerHTML += `no rankings yet 😥`; 
            }
            
            bodyDiv.innerHTML += ` <div class="rate"><input type="radio" id="star5" name="rate" value="5" onclick="updateRanking('movies', ${movieId}, '5')"/>
                                    <label for="star5" title="text">5 stars</label>
                                                    <input type="radio" id="star4" name="rate" value="4" onclick="updateRanking('movies', ${movieId}, '4')"/>
                                                    <label for="star4" title="text">4 stars</label>
                                                    <input type="radio" id="star3" name="rate" value="3" onclick="updateRanking('movies', ${movieId}, '3')"/>
                                                    <label for="star3" title="text">3 stars</label>
                                                    <input type="radio" id="star2" name="rate" value="2" onclick="updateRanking('movies', ${movieId}, '2')"/>
                                                    <label for="star2" title="text">2 stars</label>
                                                    <input type="radio" id="star1" name="rate" value="1" onclick="updateRanking('movies', ${movieId}, '1')"/>
                                                    <label for="star1" title="text">1 star</label>
                                </div>`;

            const i= document.getElementById('unique');
            const hearts = document.getElementById('hearts');

            if(favorite == "false") {
                i.style.color = "rgb(206, 202, 202)";
                i.onclick = function(){
                    addToFavs('movies', movieId);
                    i.style.color = "red";
                    hearts.style.visibility="visible";
                    return true;
                  };
            } else {
                i.style.color = "red";
                i.onclick = function(){
                    removeFromFavs('movies', movieId);
                    i.style.color = "rgb(206, 202, 202)";
                    span.style.visibility = "hidden";
                    return true;
                  };
            }

            if (!userRanking) {

            } else if (userRanking == '1') {
                document.getElementById("star1").checked = true;
            } else if (userRanking == '2') {
                document.getElementById("star2").checked = true;
            } else if (userRanking == '3') {
                document.getElementById("star3").checked = true;
            } else if (userRanking == '4') {
                document.getElementById("star4").checked = true;
            } else if (userRanking == '5') {
                document.getElementById("star5").checked = true;
            }

            //heart button
            $(function () {
                $("i").click(function () {
                    $("i,span").toggleClass("press", 1000);
                });
            });

            //carousel
            var lis = document.getElementById("carouselLis");
            for (let i = 0; i < reviews.length; i++) {
                const li = document.createElement('li');
                li.setAttribute('data-target', '#myCarousel');
                li.setAttribute('data-slide-to', i);
                if(i == 0) {
                    li.setAttribute('class', 'active');
                }
                lis.appendChild(li);
              }

              var innerList = document.getElementById("carouselInner");
                if (reviews.length == 0) {
                    const p = document.createElement('p');
                    p.innerText = "NO REVIEWS YET";
                    innerList.appendChild(p);
                }
              for (let i = 0; i < reviews.length; i++) {
                  const div = document.createElement('div'); 
                  if(i == 0) {
                    div.setAttribute('class', 'item active');
                  } else {
                    div.setAttribute('class', 'item');
                  }
                  const p = document.createElement('p');
                  p.innerText = reviews[i].desc;
                  div.appendChild(p);
                  const h5 = document.createElement('h5');
                  h5.innerText = reviews[i].name;
                  div.appendChild(h5);
                  innerList.appendChild(div);
                }

                //own review
                var self = document.getElementById("selfReview");
                const text = document.createElement('textarea');
                text.style.fontSize="16px";
                text.placeholder="Pls type here your review...";
                text.cols="30";
                text.rows="5";
                self.appendChild(text);
                if(userReview) {
                    text.value = userReview;
                }

                const but = document.createElement('button');
                but.style.background="url(../img/send.png)";
               
                but.onclick = function() {
                    updateReview('movies', movieId, text.value);
                    but.style.background="url(../img/sent.png)";
                }

                self.appendChild(but);

        },
        error: function(xhr, status, error){
            var errorMessage = xhr.status + ': ' + xhr.statusText + ' - '+ xhr.responseText;
            console.log('Error - ' + errorMessage);
        }
    });

}

async function onShowMovies() {

    var genre = localStorage.getItem('genre');
    console.log("genre: " + genre);

    var token = localStorage.getItem('token');
    console.log("token: " + token);

    $.ajax({
        url : domain + "/movies",
        type: "GET",
        headers: { 'genre': genre, 'x-access-token': token },
        dataType: 'json',
        success: function(res)
        {
            document.querySelector('h1').innerHTML=genre;
            var completelist = document.getElementById("moviesList");

            const moviesContainer = document.createElement('div');
            moviesContainer.setAttribute('class', 'container-fluid text-center my-5');
            moviesContainer.setAttribute('id', 'moviesContainer');
            completelist.appendChild(moviesContainer);
        
            const innerContainer = document.createElement('div');
            innerContainer.setAttribute('id', 'innerContainer');
            innerContainer.setAttribute('class', 'row cols-lg-3 cols-sm-1');
            moviesContainer.appendChild(innerContainer);

            res.forEach(parseMovies);
        },
        error: function(xhr, status, error){
            var errorMessage = xhr.status + ': ' + xhr.statusText + ' - '+ xhr.responseText;
            console.log('Error - ' + errorMessage);
        }
    });
} 





//BOOKS
function onBooks() {
    checkIfAuth();

    $(function () {
        $("#nav-placeholder").load("./navbar.html");
    });

    const bodyDivBooks = document.createElement('div');
    bodyDivBooks.setAttribute('class', 'container-fluid text-center my-3');
    const divInBodyDivB = document.createElement('div');
    divInBodyDivB.setAttribute('class', 'row row-cols-1 row-cols-md-3');

    const categories = [{
        type: 'romance',
        imageSrc: '../img/romance.png'
    }, {
        type: 'drama',
        imageSrc: '../img/heart1.png'
    }, {
        type: 'horror',
        imageSrc: '../img/horror.png'
    }, {
        type: 'sci',
        imageSrc: '../img/ric.png'
    }, {
        type: 'comics',
        imageSrc: '../img/comics.png'
    }, {
        type: 'fairy',
        imageSrc: '../img/fairy.png'
    }];

    const createElement = (categories) => {
        const categoryEl = document.createElement('div');
        categoryEl.setAttribute('class', 'col');

        const categoryImg = document.createElement('img');
        categoryImg.setAttribute('class', 'img-fluid');
        categoryImg.setAttribute('src', categories.imageSrc);
        categoryImg.style.height = '400px';
        categoryImg.style.width = '350px';
        categoryImg.style.cursor = 'pointer';
        categoryImg.setAttribute('onclick','fetchBooks("' + categories.type + '")');

        categoryEl.append(categoryImg);
        return categoryEl;
    }

    for (let i = 0; i < categories.length; i++) {
        divInBodyDivB.append(createElement(categories[i]));
    }

    bodyDivBooks.append(divInBodyDivB);
    document.body.append(bodyDivBooks);
};

//MOVIES

function onMovies() {

    checkIfAuth();

    $(function () {
        $("#nav-placeholder").load("./navbar.html");
    });


    const bodyDivMovies = document.createElement('div');
    bodyDivMovies.setAttribute('class', 'container-fluid text-center my-3');

    const divInBodyDivM = document.createElement('div');
    divInBodyDivM.setAttribute('class', 'row row-cols-1 row-cols-md-3');
    // divInBodyDivM.setAttribute('class', 'row row-cols-1 row-cols-md-3 img-fluid align-items-center');

    const categories = [{
        type: 'sci',
        imageSrc: '../img/sciFilm.png'
    }, {
        type: 'horror',
        imageSrc: '../img/horrorF.png'
    }, {
        type: 'animation',
        imageSrc: '../img/ursulla.png'
    }, {
        type: 'mystery',
        imageSrc: '../img/mystery.png'
    }, {
        type: 'drama',
        imageSrc: '../img/drama1.png'
    }, {
        type: 'romance',
        imageSrc: '../img/romanceFilm.png'
    }];

    const createElement = (categories) => {
        const categoryEl = document.createElement('div');
        // categoryEl.setAttribute('class', 'row col-xs-12 col-sm-12 my-2  align-items-center');
        categoryEl.setAttribute('class', 'col');

        const categoryImg = document.createElement('img');
        categoryImg.setAttribute('src', categories.imageSrc);
        categoryImg.setAttribute('class', 'img-fluid');
        categoryImg.style.height = '400px';
        categoryImg.style.width = '350px';
        categoryImg.style.cursor = 'pointer';
        categoryImg.setAttribute('onclick','fetchMovies("' + categories.type + '")');

        categoryEl.append(categoryImg);        
        return categoryEl;
    }

    for (let i = 0; i < categories.length; i++) {
        divInBodyDivM.append(createElement(categories[i]));

    }

    bodyDivMovies.append(divInBodyDivM);
    document.body.append(bodyDivMovies);
};

//GAMES

function onGames() {
    checkIfAuth();

    $(function () {
        $("#nav-placeholder").load("./navbar.html");
    });

    const bodyDiv = document.createElement('div')
    bodyDiv.setAttribute('class', 'container align-items-center');
    const divInBodyDiv = document.createElement('div');
    divInBodyDiv.setAttribute('class', 'row row-cols-lg-12 row-cols-md-12 align-items-center');

    const categories = [{
        type: 'math',
        imageSrc: '../img/math1.png',
        gameUrl: '../games/math-game/index.html'
    }, {
        type: 'memory',
        imageSrc: '../img/pump.png',
        gameUrl: '../games/memory-game/index.html'
    }];
    const createEl = (categories) => {
        const categoryEl = document.createElement('div');
        categoryEl.setAttribute('class', 'col-lg-6 col-md-6 col-sm-12 align-items-center');
        const categoryImg = document.createElement('img');
        categoryImg.setAttribute('class', 'img-fluid');
        categoryImg.setAttribute('src', categories.imageSrc);
        categoryImg.setAttribute('id', categories.type);
        categoryImg.style.position="relative";
        categoryImg.style.left="130px"
        categoryEl.append(categoryImg);

        const startButton = document.createElement('button');
        startButton.setAttribute('id', 'start-button');
        startButton.style.backgroundImage="url(../img/start1.png)";
        startButton.style.backgroundSize="90%";
        startButton.style.backgroundRepeat="no-repeat";
        startButton.setAttribute('onclick','gameChosen("' + categories.gameUrl + '")');
        categoryEl.style.position="relative";
        categoryEl.style.left="200px";
        categoryEl.style.padding="0";
        categoryEl.append(startButton);

        const highscoreButton = document.createElement('button');
        highscoreButton.setAttribute('id', 'score-button');
        highscoreButton.style.backgroundImage="url(../img/middle.png)";
        highscoreButton.style.backgroundSize="90%";
        highscoreButton.style.backgroundRepeat="no-repeat";
        highscoreButton.setAttribute('onclick','openHighscores("' + categories.type + '")');
        categoryEl.append(highscoreButton);

        return categoryEl;
    }
    for (let i = 0; i < categories.length; i++) {
        divInBodyDiv.append(createEl(categories[i]));
    }
    bodyDiv.append(divInBodyDiv);
    document.body.append(bodyDiv);
};


function openHighscores(gameName) {
    localStorage.setItem("gameName", gameName);
    let win = window.open("highscores.html", "Highscores", "toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes, resizable=yes,width=100,height=100,top="+(screen.height-400)+",left="+(screen.width-100));
    win.resizeTo(800, 1100);
}

function showHighscores() {

    var gameName = localStorage.getItem("gameName");
    console.log("gameName: " + gameName);

    var token = localStorage.getItem('token');
    console.log("token: " + token);

    var email = localStorage.getItem('userEmail');
    console.log("email: " + email);

    $.ajax({
        url : domain + "/records",
        type: "GET",
        headers: { 'email': email, 'x-access-token': token, 'gameName': gameName },
        dataType: 'json',
        success: function(res)
        {
            
           
            // window.document.body.style.background ='linear-gradient( orange, rgb(61, 56, 48))';
            // window.document.body.innerHTML = "<h1 id='user'> User's " + gameName + " Highscores </h1>";

            let scoreElement = document.getElementById("userScore");
            if (res.norecords) {
                scoreElement.innerHTML += `No records for user`;
            } else {
                res.forEach((key) => {
                    scoreElement.innerHTML += `<tr><td>${key.date} </td> <td> ${key.score}</td>`;
                });
            }

            $.ajax({
                url : domain + "/records/total",
                type: "GET",
                headers: { 'x-access-token': token, 'gameName': gameName },
                dataType: 'json',
                success: function(res)
                {
                    let totalElement = document.getElementById("totalScore");
                    if (res.norecords) {
                        totalElement.innerHTML += `No records for user`;
                    } else {
                        res.forEach((key) => {
                            totalElement.innerHTML += `<tr><td>${key.name} </td> <td>${key.date} </td> <td> ${key.score}</td>`;
                        });
                    }
                },
                error: function(xhr, status, error){
                    var errorMessage = xhr.status + ': ' + xhr.statusText + ' - '+ xhr.responseText;
                    console.log('Error - ' + errorMessage);
                    var win = window.open("", "Highscores", "toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes, resizable=yes,width=780,height=450,top="+(screen.height-400)+",left="+(screen.width-840));
        
                    window.document.body.innerHTML = "<h1> " + xhr.responseText + " </h1>";
        
                }
            });
        },
        error: function(xhr, status, error){
            var errorMessage = xhr.status + ': ' + xhr.statusText + ' - '+ xhr.responseText;
            console.log('Error - ' + errorMessage);
            var win = window.open("", "Highscores", "toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes, resizable=yes,width=780,height=450,top="+(screen.height-400)+",left="+(screen.width-840));

            win.document.body.innerHTML = "<h1> " + xhr.responseText + " </h1>";

        }
    });
}



function onContact() {
    $(function () {
        $("#nav-placeholder").load("./navbar.html");
    });
}

function sendContactForm() {

    
    const msgSent= document.getElementById('msg-sent');
    msgSent.style.visibility="visible";

    var formData = new Object();
    formData.name = document.getElementById("contactName").value;
    formData.mail = document.getElementById("contactMail").value;
    formData.phone = document.getElementById("contactPhone").value;
    formData.subject = document.getElementById("contactSubject").value;
    formData.message = document.getElementById("contactMessage").value;
    
    var jsonString = JSON.stringify(formData);

    console.log(jsonString);

    $.ajax({
        url : domain + "/contact",
        type: "POST",
        headers: { 'Content-Type': 'application/json' },
        //dataType: 'json',
        data: jsonString,
        success: function(res)
        {
            //window.location.href = './signin.html'; 
            return true;
        },
        error: function(xhr, status, error){
            var errorMessage = xhr.status + ': ' + xhr.statusText + ' - '+ xhr.responseText;
            console.log('Error - ' + errorMessage);
            return false;
        }
    });
}

function resetPassword() {
    
    var formData = new Object();
    formData.mail = document.getElementById("validationCustomUsername").value;

    var jsonString = JSON.stringify(formData);

    console.log(jsonString);

    $.ajax({
        url: domain + "/reset",
        type: "POST",
        headers: { 'Content-Type': 'application/json' },
        data: jsonString,
        success: function (res) {
            document.querySelector("h2").innerText="Check your email for your new password";
            document.querySelector("h2").style.display="block";
            return true;
        },
        error: function (xhr, status, error) {
            var errorMessage = xhr.status + ': ' + xhr.statusText + ' - ' + xhr.responseText;
            console.log('Error - ' + errorMessage);
            document.querySelector("h2").innerText=xhr.responseText;
            document.querySelector("h2").style.display="block";
            return false;
        }
    });
}

