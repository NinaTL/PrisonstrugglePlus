document.addEventListener('DOMContentLoaded', function() {
  const prisonSelect = document.getElementById('prisonSelect');
  const moveButton = document.getElementById('moveButton');
  const userIdInput = document.getElementById('userIdInput');
  const addUserButton = document.getElementById('addUserButton');
  const userList = document.getElementById('userList');
  const inviteAllButton = document.getElementById('inviteAllButton');
  const skillButtons = document.querySelectorAll('.skillButton');


  moveButton.addEventListener('click', function() {
    const prisonId = prisonSelect.value;
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: (prisonId) => {
          var form = document.createElement("form");
          form.setAttribute("method", "post");
          form.setAttribute("action", "https://prisonstruggle.com/bus.php");
          var hiddenField = document.createElement("input");
          hiddenField.setAttribute("type", "hidden");
          hiddenField.setAttribute("name", "go");
          hiddenField.setAttribute("value", prisonId);
          form.appendChild(hiddenField);
          document.body.appendChild(form);
          form.submit();

          setTimeout(() => {
            document.body.removeChild(form);
          }, 100);

          console.log('Moving to prison ID:', prisonId);

          setTimeout(() => {
            location.reload();
          }, 1000);
        },
        args: [prisonId]
      }).catch(err => console.error('Error executing script:', err));
    });
  });


  chrome.storage.local.get(['userIds'], function(result) {
    const userIds = result.userIds || [];
    userIds.forEach(id => addUserToList(id));
  });

 
  addUserButton.addEventListener('click', function() {
    const userId = userIdInput.value.trim();
    if (userId) {
      chrome.storage.local.get(['userIds'], function(result) {
        const userIds = result.userIds || [];
        if (!userIds.includes(userId)) {
          userIds.push(userId);
          chrome.storage.local.set({ userIds: userIds }, function() {
            addUserToList(userId);
            userIdInput.value = '';
          });
        }
      });
    }
  });


  function addUserToList(userId) {
    const li = document.createElement('li');
    li.textContent = userId;
    userList.appendChild(li);
  }


  inviteAllButton.addEventListener('click', async function() {
    const result = await chrome.storage.local.get(['userIds']);
    const userIds = result.userIds || [];
    await inviteUsers(userIds, 0);
  });

  async function inviteUsers(users, index) {
    if (index >= users.length) {
      console.log('All users invited');
      return;
    }

    const userId = users[index];
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: async (userId) => {
        const inputField = document.querySelector('input[name="theirid"]');
        if (inputField) {
          inputField.value = userId;


          const blurEvent = new Event('blur', { bubbles: true });
          inputField.dispatchEvent(blurEvent);


          function checkAndClickInviteButton() {
            return new Promise((resolve) => {
              const interval = setInterval(() => {
                const inviteButton = document.querySelector('input[name="invite"]');
                if (inviteButton && !inviteButton.disabled) {
                  inviteButton.click();
                  clearInterval(interval);
                  console.log('Invited user:', userId);
                  resolve();
                }
              }, 500);
            });
          }

          await checkAndClickInviteButton();
        } else {
          console.error('Input field not found');
        }
      },
      args: [userId],
    });
    await new Promise(resolve => setTimeout(resolve, 3000)); 
    await inviteUsers(users, index + 1); 
  }


  skillButtons.forEach(button => {
    button.addEventListener('click', function() {
      const skillId = this.getAttribute('data-skill');
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: (skillId) => {
            var form = document.createElement("form");
            form.setAttribute("method", "post");
            form.setAttribute("action", "https://prisonstruggle.com/userskills.php");
            var actionField = document.createElement("input");
            actionField.setAttribute("type", "hidden");
            actionField.setAttribute("name", "action");
            actionField.setAttribute("value", "ActivateSkill");
            var skillField = document.createElement("input");
            skillField.setAttribute("type", "hidden");
            skillField.setAttribute("name", "skillId");
            skillField.setAttribute("value", skillId);
            form.appendChild(actionField);
            form.appendChild(skillField);
            document.body.appendChild(form);
            form.submit();

            setTimeout(() => {
              document.body.removeChild(form);
            }, 100);

            console.log('Activating skill ID:', skillId);

            setTimeout(() => {
              location.reload();
            }, 1000);
          },
          args: [skillId]
        }).catch(err => console.error('Error executing script:', err));
      });
    });
  });
});
