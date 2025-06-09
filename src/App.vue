<script setup>
import Main from "@/components/Main.vue";
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
</script>

<template>
    <Header/>
    <main>
      <Main/>
    </main>
    <!--<footer>
      <Footer/>
    </footer>-->
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
footer{
  width: 100%;
  position: relative;
  bottom: 0;
}
main{
  /*width: 100%;
  height: 100%;*/
  position: relative;
}
</style>
