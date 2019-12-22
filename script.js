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
              <tr id="tr_${friends["id"]}">
                          <td scope="row">
                            
                              <td scope="row"><img height="34" src="https://graph.facebook.com/${friends["id"]}/picture" alt="" style="margin-right: 15px; width: 50px; height: 50px;"><a href="https://www.facebook.com/${friends["id"]}" target="_blank">${friends["name"]}</a></td>
                              <td>${friends["id"]}</td>
                              <td>${reactions}</td>
                              <td>${comments}</td>
                          </tr>
              `);
    });

    $("#status").html("Hoàn tất quá trình quét");

    $("table").DataTable({
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
      order: [[1, "asc"]],
      paging: true
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
        "){timeline_feed_units.first(500).after(" +
        after +
        "){page_info,edges{node{id,creation_time,feedback{reactors{nodes{id}},commenters{nodes{id}}}}}}}"
    );
    return fetch("https://www.facebook.com/api/graphql/", {
      method: "POST",
      credentials: "include",
      body: a
    })
      .then(e => e.json())
      .then(e => {
        //Truong hop phan trang
        if (e[uid].timeline_feed_units.page_info.has_next_page) {
          var { page_info, edges } = e[uid].timeline_feed_units;
          $("#status").html("Đang phân tích dữ liệu reactions và comments....");

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

          call_react_scan(page_info.end_cursor);
        } else {
          show_table();
          console.log(list_friends);
          console.log("stop");
        }
      });
  };

  ///remove friends
  $("#remove_friend").click(e => {
    var i = 0;
    $("#status").html(
      `<p class="text-default" style="display: inline;">Đang bắt đầu xóa...</p>`
    );
    $('span >a').click()
    $.each($("table").find('input[type="checkbox"]:checked'), function() {
         
      try {
       
        var uid = $(this)
        .parent()
        .next()
        .next()[0].innerText
        $('#tr_' + uid).remove()
        console.log(uid)
        setTimeout(() => {
          remove_friend(
            $(this)
              .parent()
              .next()
              .next()[0].innerText,
            $(this)
              .parent()
              .next()[0].innerText
          );
          
        }, i * 2000);
      } catch (error) {}
    });
    // $(this).click()paginate_button

    var n = Number($(".paginate_button:last-child")[0].text);
    console.log(n);

    for (let i = 0; i < n; i++) {
      setTimeout(() => {
        n = Number($(".paginate_button:last-child")[0].text);


        $.each($("table").find('input[type="checkbox"]:checked'), function() {
         
          try {
            console.log(
              $(this)
                .parent()
                .next()
                .next()[0].innerText
            );
            $(this).parent().parent().hide()
            setTimeout(() => {
              remove_friend(
                $(this)
                  .parent()
                  .next()
                  .next()[0].innerText,
                $(this)
                  .parent()
                  .next()[0].innerText
              );
              
            }, i * 2000);
          } catch (error) {}
        });
        $(".next").click();
      }, i * 500);
    }

    
  });

  remove_friend = (uid, name) => {
    
    //return false
    if (uid === "FB ID") {
      return false;
    }
    var a = new FormData();
    a.append("fb_dtsg", localStorage.getItem("fb_dtsg"));
    a.append("__a", "1");
    a.append("uid", '4');
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


          
          $('.tr_'+uid).remove()
          $("#status").html(
            `<p class="text-success" style="display: inline;">Đã xóa thành công : ${name}- ${uid}</p>`
          );
        }
      });
  };
} catch (error) {
  console.log(error);
}