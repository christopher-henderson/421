var search = document.getElementById("search");
console.log(search);

var body = document.getElementsByTagName("body")[0];
if (body.classList.length <= 0) {
  console.log("NO CLASS");
} else {
  for (var i=0; i < body.classList.length; i++) {
    console.log("Body has class: " + body.classList[i]);
  }
}

console.log(body.childNodes[1]);

console.log(document.getElementsByTagName("div").l1ength);

console.log(document.getElementById("lst-ib").value);

var parent = search.childNodes[1].childNodes[2].childNodes[0].childNodes[2];
var child = parent.childNodes[2];
parent.removeChild(child);
