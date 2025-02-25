<script setup>
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'

</script>

<template>
  <body>
    <!--====================  breadcrumb area ====================-->
    <div class="breadcrumb-area section-space--half">
        <div class="container wide">
            <div class="row">
                <div class="col-lg-12">
                    <RouterLink to="/">
                        <img width="100%" height="100%" src="/assets/img/backgrounds/banner-cuoc-thi.jpg" alt="Trang chủ">
                    </RouterLink>
                    <!--=======  breadcrumb wrpapper  =======-->
                    <div class="breadcrumb-wrapper">
                        <!--=======  breadcrumb content  =======-->
                        <div class="breadcrumb-content">
                            
                            <h2 class="breadcrumb-content__title"></h2>
                        </div>
                        <!--=======  End of breadcrumb content  =======-->
                    </div>
                    <!--=======  End of breadcrumb wrpapper  =======-->
                </div>
            </div>
        </div>
    </div>
    <!--====================  End of breadcrumb area  ====================-->
    <!--====================  page content area ====================-->
    <div class="page-content-area" style="margin-top: -230px;">
        <div class="container">
          <RouterView />
            
        </div>
    </div>
    <!--====================  End of page content area  ====================-->
    <!--====================  newsletter area ====================-->
    
    <!--====================  End of newsletter area  ====================-->
    <!--====================  footer area ====================-->
    <div class="footer-area">
        <div class="footer-copyright">
            <div class="container wide">
                <div class="row">
                    <div class="col-lg-12">
                        <div class="footer-copyright-wrapper footer-copyright-wrapper--default-footer">
                            <div class="container">
                                <div class="row align-items-center no-gutters">
                                    <div class="col-lg-2 col-md-2">
                                        <div class="footer-logo">
                                            <a href="#"><img width="93" height="25" src="/assets/img/logo-cuoc-thi.jpg" class="img-fluid" alt=""></a>
                                        </div>
                                    </div>
                                    <div class="col-lg-2 col-md-2">
                                        <div class="footer-logo">
                                            <a href="#"><img width="93" height="25" src="/assets/img/poly.jpg" class="img-fluid" alt=""></a>
                                        </div>
                                    </div>
                                    <div class="col-lg-2 col-md-2">
                                        <div class="footer-logo">
                                            <a href="#"><img width="93" height="25" src="/assets/img/cntt.jpg" class="img-fluid" alt=""></a>
                                        </div>
                                    </div>
                                    <div class="col-lg-2 col-md-2">
                                        <div class="footer-logo">
                                            <a href="#"><img width="93" height="25" src="/assets/img/ung-dung.jpg" class="img-fluid" alt=""></a>
                                        </div>
                                    </div>
                                    <div class="col-lg-2 col-md-2">
                                        <div class="footer-logo">
                                            <a href="#"><img width="93" height="25" src="/assets/img/pho-cao.jpg" class="img-fluid" alt=""></a>
                                        </div>
                                    </div>
                                    <div class="col-lg-2 col-md-2">
                                        <div class="footer-logo">
                                            <a href="#"><img width="93" height="25" src="/assets/img/pfs.jpg" class="img-fluid" alt=""></a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

  </body>

  
</template>

<style scoped>

</style>
