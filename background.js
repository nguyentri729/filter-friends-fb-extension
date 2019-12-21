
// //change Origin
// chrome.webRequest.onBeforeSendHeaders.addListener(
//   e => {
//     const o = e.requestHeaders,
//       t = o.findIndex(e => "Origin" === e.name);
//     return (
//       -1 === t
//         ? o.push({ name: "Origin", value: "https://www.facebook.com" })
//         : (o[t].value = "https://www.facebook.com"),
//       { requestHeaders: o }
//     );
//   },
//   {
//     urls: [
//       "https://www.facebook.com/api/graphqlbatch/*",
//       "https://www.facebook.com/api/graphql/",
//       "https://www.facebook.com/ajax/mercury/delete_thread.php",
//       "https://www.facebook.com/messaging/send/?dpr=1*",
//       "https://www.facebook.com/privacy/selector/update/*",
//       "https://www.facebook.com/ajax/profile/*"
//     ]
//   },
//   ["blocking", "requestHeaders"]
// )

// var friends_interact = [];
// //Scan react
// couting_reaction = (uid, type) => {
//   if (friends_interact[uid] !== undefined) {
//     console.log('+1 ')
//       friends_interact[uid][type] += 1
//   }else{
//       friends_interact[uid] = {
//         reactions : 1,
//         comments: 1
//       }
//       //friends_interact[uid]['reactions'] = 1
//     //  friends_interact[uid]['comments'] = 1
//   }
//   return friends_interact[uid]
// }
// call_react_scan = (after = '') => {
//   var uid = '100016029917976'
//   var a = new FormData();
//   a.append("fb_dtsg", "AQGONY7SbFZU:AQHyv2UpCr1f")
//   a.append("q", "node("+uid+"){timeline_feed_units.first(500).after(" +after+ "){page_info,edges{node{id,creation_time,feedback{reactors{nodes{id}},commenters{nodes{id}}}}}}}")
//   return fetch("https://www.facebook.com/api/graphql/", {
//     method: "POST",
//     credentials: "include",
//     body: a
//   }).then(e => e.json())
//   .then(e => {
//     if (e[uid].timeline_feed_units.page_info.has_next_page) {
//        var {page_info, edges} = e[uid].timeline_feed_units
      
//       edges.map ((edge) => {
//         //console.log(edge.node.feedback)
//         if (edge.node.feedback){
//           var {reactors, commenters} = edge.node.feedback
         
//           //console.log(reactors.nodes)
//           reactors.nodes.map((reaction,) => {
//              couting_reaction(reaction.id, 'reactions')
//           })
//           commenters.nodes.map((reaction) => {
//              couting_reaction(reaction.id, 'comments')
//           })
        
//         }
          
         
//       })
//       //console.log(friends_interact);

//        call_react_scan(page_info.end_cursor)
//     }else{
//       console.log(friends_interact);
//       console.log('stop')
//     }
//   })
// }
// call_react_scan()



