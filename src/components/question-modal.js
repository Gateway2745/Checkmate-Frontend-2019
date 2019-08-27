AFRAME.registerComponent('ques-box', {
    schema: {
          q_no: {type: 'string'},
        },

    init: function () {
      let modal = document.querySelector('.modal')
      let boards = document.getElementsByClassName('question-board')
      Array.from(boards).forEach((el) => {
        console.log('els are '+ `${el}`)
        console.log('ids are '+ `#modal-${(el.id).replace( /^\D+/g, '')}`)
        el.addEventListener('click', () => {
          $(`#modal-${(el.id).replace( /^\D+/g, '')}`).modal()
        })
      })

      document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.keyCode == 76) {
          $(`#modalCart`).modal()
        }
      })  
  }
  

})