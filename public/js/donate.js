(function() {
  'use strict';

  let toastTimeout;

  async function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.error('Clipboard API failed:', err);
        return fallbackCopy(text);
      }
    } else {
      return fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      textArea.remove();
      return successful;
    } catch (err) {
      console.error('Fallback copy failed:', err);
      textArea.remove();
      return false;
    }
  }

  function showToast() {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;

    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }

    toast.classList.add('show');

    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  async function handleCopyClick(button) {
    const address = button.getAttribute('data-address');
    if (!address) {
      console.error('No address found on button');
      return;
    }

    const originalHTML = button.innerHTML;

    try {
      const success = await copyToClipboard(address);
      
      if (success) {
        button.innerHTML = '<span class="copy-icon">✅</span> Copied!';
        button.classList.add('copied');
        
        showToast();

        setTimeout(() => {
          button.innerHTML = originalHTML;
          button.classList.remove('copied');
        }, 2000);
      } else {
        button.innerHTML = '<span class="copy-icon">❌</span> Failed';
        setTimeout(() => {
          button.innerHTML = originalHTML;
        }, 2000);
      }
    } catch (err) {
      console.error('Copy failed:', err);
      button.innerHTML = '<span class="copy-icon">❌</span> Failed';
      setTimeout(() => {
        button.innerHTML = originalHTML;
      }, 2000);
    }
  }

  function generateQRCodes() {
    const qrContainers = document.querySelectorAll('.qr-code');
    
    qrContainers.forEach(container => {
      const address = container.getAttribute('data-address');
      if (!address) return;

      try {
        new QRCode(container, {
          text: address,
          width: 200,
          height: 200,
          colorDark: '#000000',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.M
        });
      } catch (err) {
        console.error('QR code generation failed:', err);
      }
    });
  }

  function initCopyButtons() {
    const copyButtons = document.querySelectorAll('.copy-btn');
    
    copyButtons.forEach(button => {
      button.addEventListener('click', function() {
        handleCopyClick(this);
      });

      button.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCopyClick(this);
        }
      });
    });
  }

  function init() {
    initCopyButtons();
    generateQRCodes();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

