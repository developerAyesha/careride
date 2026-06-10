<template>
  <div class="empty-card">
    <div class="empty-card-img">
      <img
        :src="require('@/assets/images/vendor-changed.svg')"
        alt="no drivers yet"
        class="img-fluid"
      />
    </div>
    <div class="empty-card-msg">
      Your changes is being checked by an administrator. It may take some time before they are applied and you have access to the functionality again.
    </div>
  </div>
</template>
