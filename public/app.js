$.get("/scrape").then(function(data) {
    console.log(data)
    $.getJSON("/articles", function(data) {
      console.log(data)
      for (var i = 0; i < data.length; i++) {
        $("#articles").append("<div data-id='" + data[i]._id + "' class='articleBlock text-center'><h1>" + data[i].title + "</h1><br />"+data[i].summary+"<br /><br /><a href=http://www.espn.com"+data[i].link+" target='_blank'>http://www.espn.com" + data[i].link + "</a></div>");
      }
    });
  })
    $(document).on("click", ".articleBlock", function() {
      $("#notes").empty();
      var thisId = $(this).attr("data-id");
    
      $.ajax({
        method: "GET",
        url: "/articles/" + thisId
      })
        .then(function(data) {
          console.log(data);
          $("#notes").append("<h2>" + data.title + "</h2><br>");
          if (data.note[0]) {
            $("#notes").append("<h4>Prior Comments</h4><br>");
            for(j=0;j<data.note.length;j++){
            console.log(j)
            console.log(data.note[j].title)
            console.log(data.note[j].body)
            $("#notes").append("<div id='priorNoteTitle"+j+"' class='priorcommentstitle'></div><br>");
            $("#priorNoteTitle"+j).text(data.note[j].title)
            $("#notes").append("<div id='priorNoteBody"+j+"' class='priorcommentsbody'></div><br>");
            $("#priorNoteBody"+j).text(data.note[j].body);
            $("#notes").append("<button data-id='" + data.note[j]._id + "' id='deletenote'>Delete Note</button><br><br>");
            }}
          $("#notes").append("<h4>New Comments</h4><br>");
          $("#notes").append("<input id='titleinput' name='title' ><br>");
          $("#notes").append("<textarea id='bodyinput' name='body'></textarea><br>");
          $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button><br>");
    
        });
    });
    
    $(document).on("click", "#savenote", function() {
      var thisId = $(this).attr("data-id");
    
      $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
          title: $("#titleinput").val(),
          body: $("#bodyinput").val()
        }
      })
        .then(function(data) {
          console.log(data);
          $("#notes").empty();
        });
    
      $("#titleinput").val("");
      $("#bodyinput").val("");
    });
    $(document).on("click", "#deletenote", function() {
      var thisId = $(this).attr("data-id");
    
      $.ajax({
        method: "POST",
        url: "/articles/remove/" + thisId,
      })
        .then(function(data) {
          console.log(data);
          $("#notes").empty();
        });
    
      $("#titleinput").val("");
      $("#bodyinput").val("");
    });