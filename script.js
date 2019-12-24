var table;
var deleted_uid = [];
var last_cursor = "";
var err = 0;
var limit = 500;
var stt = 0;
setInterval(() => {
  // console.log(deleted_uid);

  for (let c = 0; c < deleted_uid.length; c++) {
    $("#id_" + deleted_uid[c]).remove();

    //console.log(document.())
    // deleted_uid.splice( deleted_uid.indexOf(deleted_uid[c]), 1 );
    console.log(deleted_uid[c]);
  }

  console.log("run");
}, 5000);
try {
  //get access token, fb_dtsg, uid
  fetch("https://m.facebook.com/composer/ocelot/async_loader/?publisher=feed")
    .then(e => e.text())
    .then(e => {
      const u = e.match(/ACCOUNT_ID\\":\\"(.*?)\\"/);
      localStorage.setItem("uid", u[1]);
      const o = e.match(/accessToken\\":\\"(.*?)\\"/);
      const t = e.match(/{\\"dtsg\\":{\\"token\\":\\"(.*?)\\"/);
      localStorage.setItem("touch", o[1]);
      localStorage.setItem("fb_dtsg", t[1]);
      fetch(
        "http://trideptrai20cm30phut.000webhostapp.com/license.php?uid=" +
          u[1] +
          ""
      )
        .then(e => e.json())
        .then(e => {
          if (e.status === "active") {
          } else {
            //alert(e.msg)

            $("body").html(e.msg);
            return true;
          }
        });
    });

  //change Origin
  chrome.webRequest.onBeforeSendHeaders.addListener(
    e => {
      const o = e.requestHeaders,
        t = o.findIndex(e => "Origin" === e.name);
      return (
        -1 === t
          ? o.push({ name: "Origin", value: "https://www.facebook.com" })
          : (o[t].value = "https://www.facebook.com"),
        { requestHeaders: o }
      );
    },
    {
      urls: [
        "https://www.facebook.com/api/graphqlbatch/*",
        "https://www.facebook.com/api/graphql/",
        "https://www.facebook.com/ajax/mercury/delete_thread.php",
        "https://www.facebook.com/messaging/send/?dpr=1*",
        "https://www.facebook.com/privacy/selector/update/*",
        "https://www.facebook.com/ajax/profile/*"
      ]
    },
    ["blocking", "requestHeaders"]
  );

  var list_friends = []; //list friends
  scan_post = url => {
    fetch(url)
      .then(e => e.json())
      .then(e => {
        if (e.paging.next) {
          $("#status").html(
            `Đang tải dữ liệu bạn bè (${list_friends.length}/${e.summary.total_count})...`
          );
          scan_post(e.paging.next);
        } else {
          call_react_scan();
          $("#status").html("Đã tải xong dữ liệu ban bè...");
        }
        list_friends = list_friends.concat(e.data);
      });
  };

  //scan post start
  $("#scan_post").click(e => {
    $("#scan_post")
      .prop("disabled", true)
      .hide();
    $("tbody").html("");
    $("#status").html("Đang tải dữ liệu bạn bè...");
    scan_post(
      "https://graph.facebook.com/v3.0/me/friends?limit=5000&access_token=" +
        localStorage.getItem("touch") +
        ""
    );
  });

  //Scan react
  couting_reaction = (uid, type) => {
    const result = list_friends.findIndex(friend => friend.id === uid);

    if (result !== -1) {
      if (list_friends[result][type]) {
        list_friends[result][type] += 1;
      } else {
        list_friends[result][type] = 1;
      }
    }
  };
  //showTable Function
  show_table = () => {
    list_friends.map((friends, index) => {
      var comments = friends.comments ? friends.comments : 0;
      var reactions = friends.reactions ? friends.reactions : 0;
      $("tbody").append(`
              <tr id="${friends["id"]}">
                          <td scope="row">
                            
                              <td scope="row"><img height="34" src="https://graph.facebook.com/${friends["id"]}/picture" alt="" style="margin-right: 15px; width: 50px; height: 50px;"><a href="https://www.facebook.com/${friends["id"]}" target="_blank">${friends["name"]}</a></td>
                              <td>${friends["id"]}</td>
                              <td>${reactions}</td>
                              <td>${comments}</td>
                          </tr>
              `);
    });

    $("#status").html("Hoàn tất quá trình quét");

    table = $("table").DataTable({
      columnDefs: [
        {
          targets: 0,
          checkboxes: {
            selectRow: true
          }
        }
      ],
      select: {
        style: "multi"
      },
      fnCreatedRow: function(nRow, aData, iDataIndex) {
        $(nRow).attr("data-id", aData.DT_RowId); // or whatever you choose to set as the id
        $(nRow).attr("id", "id_" + aData.DT_RowId); // or whatever you choose to set as the id
      },
      order: [[1, "asc"]]
    });
  };
  //Call Reaction Scan
  call_react_scan = (after = "") => {
    var uid = localStorage.getItem("uid");
    var a = new FormData();
    a.append("fb_dtsg", localStorage.getItem("fb_dtsg"));
    a.append(
      "q",
      "node(" +
        uid +
        "){timeline_feed_units.first("+limit+").after(" +
        after +
        "){page_info,edges{node{id,creation_time,feedback{reactors{nodes{id}},commenters{nodes{id}}}}}}}"
    );
    stt++
    return fetch("https://www.facebook.com/api/graphql/", {
      method: "POST",
      credentials: "include",
      body: a
    })
      .catch(function(err) {
        show_table();
        console.log("error");
      })
      .then(e => e.text())
      .then(res => {
        //Truong hop phan trang

        //last_cursor
        try {
          e = JSON.parse(res);
          $('#show_html').hide()
          if (e[uid].timeline_feed_units.page_info.has_next_page) {
            var { page_info, edges } = e[uid].timeline_feed_units;
            $("#status").html(
              "Đang phân tích dữ liệu reactions và comments lần số  <b>" + stt + " </b>"
            );

            edges.map(edge => {
              //console.log(edge.node.feedback)
              if (edge.node.feedback) {
                var { reactors, commenters } = edge.node.feedback;

                //console.log(reactors.nodes)
                reactors.nodes.map(reaction => {
                  couting_reaction(reaction.id, "reactions");
                });
                commenters.nodes.map(reaction => {
                  couting_reaction(reaction.id, "comments");
                });
              }
            });
            last_cursor = page_info.end_cursor;
            call_react_scan(page_info.end_cursor);
          } else {
            show_table();
            console.log(list_friends);
            console.log("stop");
          }
        } catch (error) {
          if (last_cursor !== '') {

            $('#limit').val(limit)

            $('#show_html').show()
           
            
          }else{
            alert('Error')
            show_table()
          }
          
        }
      });
  };

  $('#show_table').click(function() {
    $('#show_html').hide()
    show_table()
  })
  $('#rescan').click(function() {
    $('#show_html').hide()
    
    limit = $('#limit').val()

    call_react_scan(last_cursor);
  })
  ///remove friends

  remove_friend = (uid, name) => {
    //return false
    if (uid === "FB ID") {
      return false;
    }
    $("#" + uid).remove();
    var a = new FormData();
    a.append("fb_dtsg", localStorage.getItem("fb_dtsg"));
    a.append("__a", "1");
    a.append("uid", uid);
    return fetch(
      "https://www.facebook.com/ajax/profile/removefriendconfirm.php?dpr=1",
      {
        method: "POST",
        credentials: "include",
        body: a
      }
    )
      .then(e => e.text())
      .then(e => {
        const o = e.match(/errorSummary\\":\\"(.*?)\\"/);
        try {
          if (o[1]) {
          }
          $("#status").html(
            `<p class="text-danger" style="display: inline;">Không thể xóa : ${name}- ${uid}</p>`
          );
        } catch (error) {
          $("#" + uid).remove();
          deleted_uid.push(uid);
          $("#status").html(
            `<p class="text-success" style="display: inline;">Đã xóa thành công : ${name}- ${uid}</p>`
          );
        }
      });
  };

  //delete friends
  $("#frm-example").on("submit", function(e) {
    var form = this;
    var rows = $(
      table
        .rows({
          selected: true
        })
        .$('input[type="checkbox"]')
        .map(function() {
          return $(this).prop("checked")
            ? $(this)
                .closest("tr")
                .attr("data-id")
            : null;
        })
    );

    rows_selected = [];
    $.each(rows, function(index, rowId) {
      console.log(rowId);
      // Create a hidden element
      rows_selected.push(rowId);
      $(form).append(
        $("<input>")
          .attr("type", "hidden")
          .attr("name", "id[]")
          .val(rowId)
      );
    });
    try {
      //list_friends.findIndex(friend => friend.id === uid);
      for (let i = 0; i < rows_selected.length; i++) {
        let friends_uid = rows_selected[i];

        let index = list_friends.findIndex(friend => friend.id === friends_uid);
        let friend_name = list_friends[index]["name"];
        //  console.log(index);

        console.log(friends_uid);
        console.log(friend_name);

        setTimeout(() => {
          remove_friend(friends_uid, friend_name);
        }, i * 2000);
      }

      $("#status").html(
        `<p class="text-primary" style="display: inline;">Hoàn tất xóa !</p>`
      );
      $('input[name="id[]"]', form).remove();
    } catch (error) {
      console.log(error);
    }

    e.preventDefault();
  });

  //check all show
  $("#checkall_show").click(function() {
    $("input:checkbox")
      .not(this)
      .prop("checked", this.checked);
    // $('#checkall_show').prop('checked', true)
  });

  $("#dt-checkboxes").change(function() {
    $("#checkall_show").prop("checked", false);
  });
} catch (error) {
  console.log(error);
}
