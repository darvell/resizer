document.addEventListener('DOMContentLoaded', function() {
    const dropArea = document.getElementById('drop-area');
    const resizePercentage = document.getElementById('resize-percentage');
    const interpolationToggle = document.getElementById('interpolation-toggle');
    const resizeButton = document.getElementById('resize-button');
    const previewContainer = document.getElementById('preview-container');

    
    let originalImage = null;
    let originalFileName = '';
  
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, preventDefaults, false);
      document.body.addEventListener(eventName, preventDefaults, false);
    });
  
    // Highlight drop area when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
      dropArea.addEventListener(eventName, () => dropArea.classList.add('bg-light'), false);
    });
  
    ['dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, () => dropArea.classList.remove('bg-light'), false);
    });
  

    // Handle file drop
    function handleDrop(e) {
        console.log(e);
        let dt = e.dataTransfer;
        let file = dt.files[0];
        loadAndDisplayImage(file);
    }

    dropArea.addEventListener('drop', handleDrop, false);
  
    document.addEventListener('paste', async (event) => {
        // we gotta do the getData thing because the clipboardData is not supported in all browsers
        // https://developer.mozilla.org/en-US/docs/Web/API/ClipboardEvent/clipboardData

        let items = (event.clipboardData || event.originalEvent.clipboardData).items;
        if (!items) return;

        let blob = null;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') === 0) {
                blob = items[i].getAsFile();
            }
        }

        if (blob) {
            loadAndDisplayImage(blob);
        }

        // Maybe it's in files? It's not the worst idea to check both.
        let file = event.clipboardData.files[0];

      

      if (file) loadAndDisplayImage(file);
    });
  
    // Load and display image
    function loadAndDisplayImage(file) {
      originalFileName = file.name;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        originalImage = new Image();
        originalImage.src = reader.result;
        previewContainer.innerHTML = '';
        previewContainer.appendChild(originalImage);
        // Change the text of our drag and drop to say we have an image
        // check if it's already an image loaded, if so we change to another thing.
        // it's a little piece of feedback to say i got your new pic.
        const messages = ['Image Loaded :)', 'Image Loaded :^)', 'Got Ur Image :D'];       
        // make sure we don't get the same message twice in a row.
        let lastMessage = dropArea.textContent;
        while (dropArea.textContent === lastMessage) {
            dropArea.textContent = messages[Math.floor(Math.random() * messages.length)];
        }

      };
    }
  
    // Resize image and provide download link
    resizeButton.addEventListener('click', function() {
      if (!originalImage || !resizePercentage.value) return;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
  
      const resizeFactor = parseInt(resizePercentage.value) / 100;
      canvas.width = originalImage.width * resizeFactor;
      canvas.height = originalImage.height * resizeFactor;
  
      ctx.imageSmoothingEnabled = interpolationToggle.checked;
      ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
  
      previewContainer.innerHTML = '';
      previewContainer.appendChild(canvas);
  
      // Prepare filename with percentage
      const fileNameParts = originalFileName.split('.');
      const extension = fileNameParts.pop();
      const newFileName = `${fileNameParts.join('.')}-${resizePercentage.value}.${extension}`;
        

      // Generate download link
      canvas.toBlob(function(blob) {
        const newImg = document.createElement('img');
        const url = URL.createObjectURL(blob);
  
        newImg.onload = function() {
          // save memory, apparently browsers leak, lol. 2024 rules.
          URL.revokeObjectURL(url);
        };
  
        newImg.src = url;
        newImg.style.maxWidth = '100%';
        previewContainer.appendChild(newImg);
  
        const link = document.createElement('a');
        link.href = url;
        link.download = newFileName;
        link.textContent = 'Download Resized Image';
        link.className = 'btn btn-success mt-3';
        previewContainer.appendChild(link);
        link.click();
        link.remove();
      }, 'image/png');  // This is not good, it's always actually PNG.
    });
  
    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }
    // handle all the preset buttons.
    document.querySelectorAll('.preset').forEach(button => {
        button.addEventListener('click', function() {
            resizePercentage.value = button.dataset.percent;
        });
    });

    // make it so you can click the drop area to open a file dialog.
    dropArea.addEventListener('click', function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = function() {
            loadAndDisplayImage(input.files[0]);
        };
        input.click();
    });

    
  });
  