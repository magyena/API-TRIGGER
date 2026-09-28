# PowerShell script to create HIJAFERA BRAND DNA PowerPoint presentation (.pptx)

$pptxPath = "c:\Users\UsEr\Documents\Hijafera\API Trigger\HIJAFERA_BRAND_DNA.pptx"

try {
    Write-Host "Initializing PowerPoint Application..."
    $pptApp = New-Object -ComObject PowerPoint.Application
    try { $pptApp.Visible = 1 } catch { Write-Host "Could not set Visible: $_" }
    
    # 0 = msoFalse (WithWindow=False) or 1 (WithWindow=True)
    $presentation = $null
    try {
        $presentation = $pptApp.Presentations.Add(1)
    } catch {
        Write-Host "Trying Add(0)..."
        $presentation = $pptApp.Presentations.Add(0)
    }

    if ($null -eq $presentation) {
        throw "Failed to create Presentation object."
    }

    function RGB($r, $g, $b) {
        return $r + ($g * 256) + ($b * 65536)
    }

    $cPurple = RGB 81 38 154
    $cGold = RGB 219 177 90
    $cCream = RGB 251 243 234
    $cWhite = RGB 255 255 255
    $cDarkText = RGB 42 36 56

    function Set-SlideBg($slide, $color) {
        $slide.FollowMasterBackground = 0
        $slide.Background.Fill.Solid()
        $slide.Background.Fill.ForeColor.RGB = $color
    }

    function Add-Header($slide, $badgeText, $isDark = $false) {
        $badge = $slide.Shapes.AddShape(1, 40, 30, 220, 25)
        $badge.Fill.Solid()
        if ($isDark) {
            $badge.Fill.ForeColor.RGB = $cGold
            $badge.TextFrame.TextRange.Font.Color.RGB = $cPurple
        } else {
            $badge.Fill.ForeColor.RGB = $cPurple
            $badge.TextFrame.TextRange.Font.Color.RGB = $cGold
        }
        $badge.Line.Visible = 0
        $badge.TextFrame.TextRange.Text = $badgeText
        $badge.TextFrame.TextRange.Font.Size = 10
        $badge.TextFrame.TextRange.Font.Bold = 1
        $badge.TextFrame.TextRange.Font.Name = "Arial"

        $logo = $slide.Shapes.AddTextbox(1, 800, 25, 120, 30)
        $logo.TextFrame.TextRange.Text = "HIJAFERA"
        $logo.TextFrame.TextRange.Font.Size = 16
        $logo.TextFrame.TextRange.Font.Bold = 1
        $logo.TextFrame.TextRange.Font.Name = "Georgia"
        if ($isDark) {
            $logo.TextFrame.TextRange.Font.Color.RGB = $cGold
        } else {
            $logo.TextFrame.TextRange.Font.Color.RGB = $cPurple
        }
    }

    # SLIDE 1: Title Slide (Dark)
    Write-Host "Creating Slide 1: Cover..."
    $s1 = $presentation.Slides.Add(1, 12)
    Set-SlideBg $s1 $cPurple
    Add-Header $s1 "BRAND DNA STRATEGY" $true

    $t1 = $s1.Shapes.AddTextbox(1, 100, 180, 760, 200)
    $tf1 = $t1.TextFrame.TextRange
    $tf1.Text = "HIJAFERA`nModest with Confidence"
    $tf1.Font.Name = "Georgia"
    $tf1.Font.Size = 48
    $tf1.Font.Bold = 1
    $tf1.Font.Color.RGB = $cWhite
    $tf1.Paragraphs(2).Font.Size = 28
    $tf1.Paragraphs(2).Font.Color.RGB = $cGold
    $tf1.Paragraphs(2).Font.Italic = 1

    $sub1 = $s1.Shapes.AddTextbox(1, 100, 380, 760, 100)
    $sub1.TextFrame.TextRange.Text = "Official Brand Strategy & Guidelines Presentation`nELEGANT • MODERN • COMFORTABLE • TIMELESS • CONFIDENT • GROWTH"
    $sub1.TextFrame.TextRange.Font.Name = "Arial"
    $sub1.TextFrame.TextRange.Font.Size = 13
    $sub1.TextFrame.TextRange.Font.Color.RGB = $cCream

    # SLIDE 2: Our Purpose
    Write-Host "Creating Slide 2: Purpose..."
    $s2 = $presentation.Slides.Add(2, 12)
    Set-SlideBg $s2 $cCream
    Add-Header $s2 "01. OUR PURPOSE"

    $t2 = $s2.Shapes.AddTextbox(1, 40, 70, 880, 50)
    $t2.TextFrame.TextRange.Text = "Mengapa Hijafera Ada?"
    $t2.TextFrame.TextRange.Font.Name = "Georgia"
    $t2.TextFrame.TextRange.Font.Size = 32
    $t2.TextFrame.TextRange.Font.Bold = 1
    $t2.TextFrame.TextRange.Font.Color.RGB = $cPurple

    $card2_1 = $s2.Shapes.AddShape(1, 50, 140, 410, 320)
    $card2_1.Fill.Solid()
    $card2_1.Fill.ForeColor.RGB = $cWhite
    $card2_1.Line.Color.RGB = $cGold
    $card2_1.Line.Weight = 2
    $card2_1.TextFrame.TextRange.Text = "Kami hadir untuk menemani muslim modern agar berani bertumbuh setiap hari melalui modest fashion yang nyaman, modern, dan membuat mereka lebih percaya diri."
    $card2_1.TextFrame.TextRange.Font.Name = "Arial"
    $card2_1.TextFrame.TextRange.Font.Size = 16
    $card2_1.TextFrame.TextRange.Font.Color.RGB = $cDarkText

    $card2_2 = $s2.Shapes.AddShape(1, 490, 140, 410, 320)
    $card2_2.Fill.Solid()
    $card2_2.Fill.ForeColor.RGB = $cPurple
    $card2_2.Line.Visible = 0
    $card2_2.TextFrame.TextRange.Text = """Kami tidak sekadar membuat pakaian.`n`nKami menciptakan rasa percaya diri untuk menemani setiap langkah kehidupan."""
    $card2_2.TextFrame.TextRange.Font.Name = "Georgia"
    $card2_2.TextFrame.TextRange.Font.Size = 22
    $card2_2.TextFrame.TextRange.Font.Italic = 1
    $card2_2.TextFrame.TextRange.Font.Color.RGB = $cGold

    # SLIDE 3: Our Vision (Dark)
    Write-Host "Creating Slide 3: Vision..."
    $s3 = $presentation.Slides.Add(3, 12)
    Set-SlideBg $s3 $cPurple
    Add-Header $s3 "02. OUR VISION" $true

    $t3 = $s3.Shapes.AddTextbox(1, 100, 120, 760, 60)
    $t3.TextFrame.TextRange.Text = "Visi Masa Depan Hijafera"
    $t3.TextFrame.TextRange.Font.Name = "Georgia"
    $t3.TextFrame.TextRange.Font.Size = 32
    $t3.TextFrame.TextRange.Font.Bold = 1
    $t3.TextFrame.TextRange.Font.Color.RGB = $cGold

    $box3 = $s3.Shapes.AddShape(1, 80, 200, 800, 240)
    $box3.Fill.Solid()
    $box3.Fill.ForeColor.RGB = RGB 65 30 125
    $box3.Line.Color.RGB = $cGold
    $box3.Line.Weight = 2
    $box3.TextFrame.TextRange.Text = """Menjadi Modern Modest Fashion House dari Indonesia yang menginspirasi jutaan muslim di Asia Tenggara untuk tampil percaya diri dalam setiap fase kehidupan."""
    $box3.TextFrame.TextRange.Font.Name = "Georgia"
    $box3.TextFrame.TextRange.Font.Size = 24
    $box3.TextFrame.TextRange.Font.Color.RGB = $cWhite

    # SLIDE 4: Our Mission
    Write-Host "Creating Slide 4: Mission..."
    $s4 = $presentation.Slides.Add(4, 12)
    Set-SlideBg $s4 $cCream
    Add-Header $s4 "03. OUR MISSION"

    $t4 = $s4.Shapes.AddTextbox(1, 40, 70, 880, 50)
    $t4.TextFrame.TextRange.Text = "5 Misi Utama Hijafera"
    $t4.TextFrame.TextRange.Font.Name = "Georgia"
    $t4.TextFrame.TextRange.Font.Size = 32
    $t4.TextFrame.TextRange.Font.Bold = 1
    $t4.TextFrame.TextRange.Font.Color.RGB = $cPurple

    $m1 = $s4.Shapes.AddShape(1, 60, 130, 830, 50)
    $m1.Fill.Solid(); $m1.Fill.ForeColor.RGB = $cWhite; $m1.Line.Color.RGB = $cGold
    $m1.TextFrame.TextRange.Text = "1. Kualitas Premium: Menghadirkan modest fashion premium dengan kualitas terbaik."
    $m1.TextFrame.TextRange.Font.Name = "Arial"; $m1.TextFrame.TextRange.Font.Size = 13; $m1.TextFrame.TextRange.Font.Color.RGB = $cDarkText

    $m2 = $s4.Shapes.AddShape(1, 60, 190, 830, 50)
    $m2.Fill.Solid(); $m2.Fill.ForeColor.RGB = $cWhite; $m2.Line.Color.RGB = $cGold
    $m2.TextFrame.TextRange.Text = "2. Fresh & Modern: Mendesain produk yang membuat pemakainya terlihat lebih fresh, modern, dan percaya diri."
    $m2.TextFrame.TextRange.Font.Name = "Arial"; $m2.TextFrame.TextRange.Font.Size = 13; $m2.TextFrame.TextRange.Font.Color.RGB = $cDarkText

    $m3 = $s4.Shapes.AddShape(1, 60, 250, 830, 50)
    $m3.Fill.Solid(); $m3.Fill.ForeColor.RGB = $cWhite; $m3.Line.Color.RGB = $cGold
    $m3.TextFrame.TextRange.Text = "3. Material Nyaman: Menggunakan material yang ringan, nyaman, dan tidak mudah membuat gerah."
    $m3.TextFrame.TextRange.Font.Name = "Arial"; $m3.TextFrame.TextRange.Font.Size = 13; $m3.TextFrame.TextRange.Font.Color.RGB = $cDarkText

    $m4 = $s4.Shapes.AddShape(1, 60, 310, 830, 50)
    $m4.Fill.Solid(); $m4.Fill.ForeColor.RGB = $cWhite; $m4.Line.Color.RGB = $cGold
    $m4.TextFrame.TextRange.Text = "4. Teman Perjalanan: Menjadi teman perjalanan pelanggan dalam setiap proses bertumbuh."
    $m4.TextFrame.TextRange.Font.Name = "Arial"; $m4.TextFrame.TextRange.Font.Size = 13; $m4.TextFrame.TextRange.Font.Color.RGB = $cDarkText

    $m5 = $s4.Shapes.AddShape(1, 60, 370, 830, 50)
    $m5.Fill.Solid(); $m5.Fill.ForeColor.RGB = $cWhite; $m5.Line.Color.RGB = $cGold
    $m5.TextFrame.TextRange.Text = "5. Komunitas: Membangun komunitas yang saling menginspirasi melalui gerakan Berani Bertumbuh."
    $m5.TextFrame.TextRange.Font.Name = "Arial"; $m5.TextFrame.TextRange.Font.Size = 13; $m5.TextFrame.TextRange.Font.Color.RGB = $cDarkText

    # SLIDE 5: Our Movement
    Write-Host "Creating Slide 5: Movement..."
    $s5 = $presentation.Slides.Add(5, 12)
    Set-SlideBg $s5 $cCream
    Add-Header $s5 "04. OUR MOVEMENT"

    $t5 = $s5.Shapes.AddTextbox(1, 40, 70, 880, 50)
    $t5.TextFrame.TextRange.Text = "BERANI BERTUMBUH"
    $t5.TextFrame.TextRange.Font.Name = "Georgia"
    $t5.TextFrame.TextRange.Font.Size = 34
    $t5.TextFrame.TextRange.Font.Bold = 1
    $t5.TextFrame.TextRange.Font.Color.RGB = $cPurple

    $card5 = $s5.Shapes.AddShape(1, 60, 130, 830, 340)
    $card5.Fill.Solid()
    $card5.Fill.ForeColor.RGB = $cWhite
    $card5.Line.Color.RGB = $cPurple
    $card5.TextFrame.TextRange.Text = "Kami percaya bahwa setiap orang sedang berada dalam proses:`n`n* Ada yang sedang membangun karier.`n* Ada yang baru menikah.`n* Ada yang sedang kuliah.`n* Ada yang sedang membangun bisnis.`n* Ada yang sedang menjadi versi terbaik dirinya.`n`nHijafera hadir untuk menemani perjalanan tersebut."
    $card5.TextFrame.TextRange.Font.Name = "Arial"
    $card5.TextFrame.TextRange.Font.Size = 15
    $card5.TextFrame.TextRange.Font.Color.RGB = $cDarkText

    # SLIDE 6: Tagline & Essence (Dark)
    Write-Host "Creating Slide 6: Tagline & Essence..."
    $s6 = $presentation.Slides.Add(6, 12)
    Set-SlideBg $s6 $cPurple
    Add-Header $s6 "05 & 06. TAGLINE & ESSENCE" $true

    $b6_1 = $s6.Shapes.AddShape(1, 60, 140, 400, 300)
    $b6_1.Fill.Solid()
    $b6_1.Fill.ForeColor.RGB = RGB 65 30 125
    $b6_1.Line.Color.RGB = $cGold
    $b6_1.TextFrame.TextRange.Text = "05. OUR TAGLINE`n`nModest with Confidence"
    $b6_1.TextFrame.TextRange.Font.Name = "Georgia"
    $b6_1.TextFrame.TextRange.Font.Size = 28
    $b6_1.TextFrame.TextRange.Font.Color.RGB = $cGold

    $b6_2 = $s6.Shapes.AddShape(1, 480, 140, 400, 300)
    $b6_2.Fill.Solid()
    $b6_2.Fill.ForeColor.RGB = RGB 65 30 125
    $b6_2.Line.Color.RGB = $cGold
    $b6_2.TextFrame.TextRange.Text = "06. BRAND ESSENCE`n`nQuiet Confidence`n`n* Percaya diri tanpa perlu berlebihan.`n* Elegan tanpa harus menarik perhatian.`n* Nyaman menjadi diri sendiri."
    $b6_2.TextFrame.TextRange.Font.Name = "Arial"
    $b6_2.TextFrame.TextRange.Font.Size = 14
    $b6_2.TextFrame.TextRange.Font.Color.RGB = $cWhite

    # SLIDE 7: Brand Promise
    Write-Host "Creating Slide 7: Brand Promise..."
    $s7 = $presentation.Slides.Add(7, 12)
    Set-SlideBg $s7 $cCream
    Add-Header $s7 "07. BRAND PROMISE"

    $t7 = $s7.Shapes.AddTextbox(1, 40, 70, 880, 50)
    $t7.TextFrame.TextRange.Text = "Janji Brand Kepada Pelanggan"
    $t7.TextFrame.TextRange.Font.Name = "Georgia"
    $t7.TextFrame.TextRange.Font.Size = 32
    $t7.TextFrame.TextRange.Font.Bold = 1
    $t7.TextFrame.TextRange.Font.Color.RGB = $cPurple

    $p1 = $s7.Shapes.AddShape(1, 60, 140, 400, 130)
    $p1.Fill.Solid(); $p1.Fill.ForeColor.RGB = $cWhite; $p1.Line.Color.RGB = $cGold; $p1.Line.Weight = 2
    $p1.TextFrame.TextRange.Text = "[+] Membuat pelanggan terlihat lebih fresh."
    $p1.TextFrame.TextRange.Font.Name = "Arial"; $p1.TextFrame.TextRange.Font.Size = 15; $p1.TextFrame.TextRange.Font.Bold = 1; $p1.TextFrame.TextRange.Font.Color.RGB = $cPurple

    $p2 = $s7.Shapes.AddShape(1, 480, 140, 400, 130)
    $p2.Fill.Solid(); $p2.Fill.ForeColor.RGB = $cWhite; $p2.Line.Color.RGB = $cGold; $p2.Line.Weight = 2
    $p2.TextFrame.TextRange.Text = "[+] Memberikan kesan lebih proporsional melalui desain dan siluet."
    $p2.TextFrame.TextRange.Font.Name = "Arial"; $p2.TextFrame.TextRange.Font.Size = 15; $p2.TextFrame.TextRange.Font.Bold = 1; $p2.TextFrame.TextRange.Font.Color.RGB = $cPurple

    $p3 = $s7.Shapes.AddShape(1, 60, 290, 400, 130)
    $p3.Fill.Solid(); $p3.Fill.ForeColor.RGB = $cWhite; $p3.Line.Color.RGB = $cGold; $p3.Line.Weight = 2
    $p3.TextFrame.TextRange.Text = "[+] Nyaman dipakai dari pagi hingga malam."
    $p3.TextFrame.TextRange.Font.Name = "Arial"; $p3.TextFrame.TextRange.Font.Size = 15; $p3.TextFrame.TextRange.Font.Bold = 1; $p3.TextFrame.TextRange.Font.Color.RGB = $cPurple

    $p4 = $s7.Shapes.AddShape(1, 480, 290, 400, 130)
    $p4.Fill.Solid(); $p4.Fill.ForeColor.RGB = $cWhite; $p4.Line.Color.RGB = $cGold; $p4.Line.Weight = 2
    $p4.TextFrame.TextRange.Text = "[+] Memberikan rasa percaya diri dalam setiap aktivitas."
    $p4.TextFrame.TextRange.Font.Name = "Arial"; $p4.TextFrame.TextRange.Font.Size = 15; $p4.TextFrame.TextRange.Font.Bold = 1; $p4.TextFrame.TextRange.Font.Color.RGB = $cPurple

    # SLIDE 8: Customer Transformation
    Write-Host "Creating Slide 8: Transformation..."
    $s8 = $presentation.Slides.Add(8, 12)
    Set-SlideBg $s8 $cCream
    Add-Header $s8 "08. CUSTOMER TRANSFORMATION"

    $t8 = $s8.Shapes.AddTextbox(1, 40, 70, 880, 50)
    $t8.TextFrame.TextRange.Text = "Transformasi Pelanggan Hijafera"
    $t8.TextFrame.TextRange.Font.Name = "Georgia"
    $t8.TextFrame.TextRange.Font.Size = 32
    $t8.TextFrame.TextRange.Font.Bold = 1
    $t8.TextFrame.TextRange.Font.Color.RGB = $cPurple

    $bBefore = $s8.Shapes.AddShape(1, 60, 140, 390, 310)
    $bBefore.Fill.Solid(); $bBefore.Fill.ForeColor.RGB = RGB 255 240 240; $bBefore.Line.Color.RGB = RGB 230 100 100
    $bBefore.TextFrame.TextRange.Text = "SEBELUM MEMAKAI HIJAFERA:`n`n[X] Bingung memilih outfit.`n[X] Takut terlihat tua.`n[X] Takut terlihat kurang proporsional.`n[X] Tidak nyaman karena bahan panas."
    $bBefore.TextFrame.TextRange.Font.Name = "Arial"; $bBefore.TextFrame.TextRange.Font.Size = 14; $bBefore.TextFrame.TextRange.Font.Color.RGB = $cDarkText

    $bAfter = $s8.Shapes.AddShape(1, 490, 140, 390, 310)
    $bAfter.Fill.Solid(); $bAfter.Fill.ForeColor.RGB = RGB 240 255 240; $bAfter.Line.Color.RGB = RGB 100 200 100
    $bAfter.TextFrame.TextRange.Text = "SETELAH MEMAKAI HIJAFERA:`n`n[V] Terlihat lebih fresh.`n[V] Terlihat lebih modern.`n[V] Lebih percaya diri.`n[V] Nyaman sepanjang hari.`n[V] Siap menjalani aktivitas."
    $bAfter.TextFrame.TextRange.Font.Name = "Arial"; $bAfter.TextFrame.TextRange.Font.Size = 14; $bAfter.TextFrame.TextRange.Font.Color.RGB = $cDarkText

    # SLIDE 9: Brand Values
    Write-Host "Creating Slide 9: Brand Values..."
    $s9 = $presentation.Slides.Add(9, 12)
    Set-SlideBg $s9 $cCream
    Add-Header $s9 "09. BRAND VALUES"

    $t9 = $s9.Shapes.AddTextbox(1, 40, 70, 880, 50)
    $t9.TextFrame.TextRange.Text = "7 Nilai Utama Brand"
    $t9.TextFrame.TextRange.Font.Name = "Georgia"
    $t9.TextFrame.TextRange.Font.Size = 32
    $t9.TextFrame.TextRange.Font.Bold = 1
    $t9.TextFrame.TextRange.Font.Color.RGB = $cPurple

    $vText = "CONFIDENCE: Percaya diri menjadi diri sendiri.`nCOMFORT: Nyaman dipakai setiap hari.`nELEGANCE: Sederhana namun berkelas.`nTIMELESS: Tidak mengikuti tren sesaat.`nEXCELLENCE: Detail kecil menentukan kualitas besar.`nGROWTH: Selalu bertumbuh bersama pelanggan.`nINTEGRITY: Jujur dalam produk, pelayanan, dan komunikasi."

    $vBox = $s9.Shapes.AddShape(1, 60, 130, 830, 320)
    $vBox.Fill.Solid(); $vBox.Fill.ForeColor.RGB = $cWhite; $vBox.Line.Color.RGB = $cGold
    $vBox.TextFrame.TextRange.Text = $vText
    $vBox.TextFrame.TextRange.Font.Name = "Arial"
    $vBox.TextFrame.TextRange.Font.Size = 14
    $vBox.TextFrame.TextRange.Font.Color.RGB = $cPurple

    # SLIDE 10: Brand Personality
    Write-Host "Creating Slide 10: Personality..."
    $s10 = $presentation.Slides.Add(10, 12)
    Set-SlideBg $s10 $cCream
    Add-Header $s10 "10. BRAND PERSONALITY"

    $t10 = $s10.Shapes.AddTextbox(1, 40, 70, 880, 50)
    $t10.TextFrame.TextRange.Text = "Karakter Personalitas Hijafera"
    $t10.TextFrame.TextRange.Font.Name = "Georgia"
    $t10.TextFrame.TextRange.Font.Size = 32
    $t10.TextFrame.TextRange.Font.Bold = 1
    $t10.TextFrame.TextRange.Font.Color.RGB = $cPurple

    $pBox = $s10.Shapes.AddShape(1, 60, 140, 830, 300)
    $pBox.Fill.Solid(); $pBox.Fill.ForeColor.RGB = $cPurple
    $pBox.Line.Visible = 0
    $pBox.TextFrame.TextRange.Text = "Elegan  +  Modern  +  Hangat  +  Optimis`n`nDewasa  +  Berkelas  +  Inspiratif  +  Bersahabat"
    $pBox.TextFrame.TextRange.Font.Name = "Arial"
    $pBox.TextFrame.TextRange.Font.Size = 22
    $pBox.TextFrame.TextRange.Font.Bold = 1
    $pBox.TextFrame.TextRange.Font.Color.RGB = $cGold

    # SLIDE 11: Visual Direction
    Write-Host "Creating Slide 11: Visual Direction..."
    $s11 = $presentation.Slides.Add(11, 12)
    Set-SlideBg $s11 $cCream
    Add-Header $s11 "11. VISUAL DIRECTION"

    $t11 = $s11.Shapes.AddTextbox(1, 40, 70, 880, 50)
    $t11.TextFrame.TextRange.Text = "Arah Visual: Warna & Mood"
    $t11.TextFrame.TextRange.Font.Name = "Georgia"
    $t11.TextFrame.TextRange.Font.Size = 32
    $t11.TextFrame.TextRange.Font.Bold = 1
    $t11.TextFrame.TextRange.Font.Color.RGB = $cPurple

    $sw1 = $s11.Shapes.AddShape(1, 60, 140, 190, 100)
    $sw1.Fill.Solid(); $sw1.Fill.ForeColor.RGB = $cPurple
    $sw1.TextFrame.TextRange.Text = "Deep Purple`n#51269A"
    $sw1.TextFrame.TextRange.Font.Color.RGB = $cWhite

    $sw2 = $s11.Shapes.AddShape(1, 270, 140, 190, 100)
    $sw2.Fill.Solid(); $sw2.Fill.ForeColor.RGB = $cGold
    $sw2.TextFrame.TextRange.Text = "Gold`n#DBB15A"
    $sw2.TextFrame.TextRange.Font.Color.RGB = $cDarkText

    $sw3 = $s11.Shapes.AddShape(1, 480, 140, 190, 100)
    $sw3.Fill.Solid(); $sw3.Fill.ForeColor.RGB = $cCream
    $sw3.TextFrame.TextRange.Text = "Warm Cream`n#FBF3EA"
    $sw3.TextFrame.TextRange.Font.Color.RGB = $cDarkText

    $sw4 = $s11.Shapes.AddShape(1, 690, 140, 190, 100)
    $sw4.Fill.Solid(); $sw4.Fill.ForeColor.RGB = $cWhite
    $sw4.TextFrame.TextRange.Text = "White`n#FFFFFF"
    $sw4.TextFrame.TextRange.Font.Color.RGB = $cDarkText

    $mb = $s11.Shapes.AddShape(1, 60, 270, 820, 170)
    $mb.Fill.Solid(); $mb.Fill.ForeColor.RGB = $cWhite
    $mb.Line.Color.RGB = $cGold
    $mb.TextFrame.TextRange.Text = "VISUAL MOOD BOARD:`n`nPremium • Editorial • Luxury • Clean • Natural • Soft Lighting • Minimal • Timeless"
    $mb.TextFrame.TextRange.Font.Name = "Arial"
    $mb.TextFrame.TextRange.Font.Size = 18
    $mb.TextFrame.TextRange.Font.Color.RGB = $cPurple

    # SLIDE 12: Design Principle
    Write-Host "Creating Slide 12: Design Principle..."
    $s12 = $presentation.Slides.Add(12, 12)
    Set-SlideBg $s12 $cCream
    Add-Header $s12 "12. DESIGN PRINCIPLE"

    $t12 = $s12.Shapes.AddTextbox(1, 40, 70, 880, 50)
    $t12.TextFrame.TextRange.Text = "Prinsip Desain Produk Hijafera"
    $t12.TextFrame.TextRange.Font.Name = "Georgia"
    $t12.TextFrame.TextRange.Font.Size = 32
    $t12.TextFrame.TextRange.Font.Bold = 1
    $t12.TextFrame.TextRange.Font.Color.RGB = $cPurple

    $b12 = $s12.Shapes.AddShape(1, 60, 140, 830, 310)
    $b12.Fill.Solid(); $b12.Fill.ForeColor.RGB = $cWhite
    $b12.Line.Color.RGB = $cGold
    $b12.TextFrame.TextRange.Text = "Semua produk Hijafera harus membuat pelanggan merasa:`n`n* Lebih muda.`n* Lebih fresh.`n* Lebih percaya diri.`n* Lebih nyaman.`n* Tidak terasa gerah.`n* Mudah dipadukan.`n* Cocok dipakai setiap hari."
    $b12.TextFrame.TextRange.Font.Name = "Arial"
    $b12.TextFrame.TextRange.Font.Size = 16
    $b12.TextFrame.TextRange.Font.Color.RGB = $cDarkText

    # SLIDE 13: Brand Voice
    Write-Host "Creating Slide 13: Brand Voice..."
    $s13 = $presentation.Slides.Add(13, 12)
    Set-SlideBg $s13 $cCream
    Add-Header $s13 "13. BRAND VOICE"

    $t13 = $s13.Shapes.AddTextbox(1, 40, 70, 880, 50)
    $t13.TextFrame.TextRange.Text = "Gaya Bahasa dan Komunikasi"
    $t13.TextFrame.TextRange.Font.Name = "Georgia"
    $t13.TextFrame.TextRange.Font.Size = 32
    $t13.TextFrame.TextRange.Font.Bold = 1
    $t13.TextFrame.TextRange.Font.Color.RGB = $cPurple

    $bv1 = $s13.Shapes.AddShape(1, 60, 140, 390, 300)
    $bv1.Fill.Solid(); $bv1.Fill.ForeColor.RGB = RGB 255 240 240; $bv1.Line.Color.RGB = RGB 230 100 100
    $bv1.TextFrame.TextRange.Text = "HAL YANG HARUS DIHINDARI:`n`n[X] Jangan terdengar seperti marketplace.`n[X] Jangan terdengar seperti sedang hard selling."
    $bv1.TextFrame.TextRange.Font.Name = "Arial"; $bv1.TextFrame.TextRange.Font.Size = 15; $bv1.TextFrame.TextRange.Font.Color.RGB = $cDarkText

    $bv2 = $s13.Shapes.AddShape(1, 490, 140, 390, 300)
    $bv2.Fill.Solid(); $bv2.Fill.ForeColor.RGB = RGB 240 255 240; $bv2.Line.Color.RGB = RGB 100 200 100
    $bv2.TextFrame.TextRange.Text = "GUNAKAN BAHASA YANG:`n`n[V] Hangat`n[V] Elegan`n[V] Optimis`n[V] Menenangkan`n[V] Memberikan semangat"
    $bv2.TextFrame.TextRange.Font.Name = "Arial"; $bv2.TextFrame.TextRange.Font.Size = 15; $bv2.TextFrame.TextRange.Font.Color.RGB = $cDarkText

    # SLIDE 14: Golden Circle
    Write-Host "Creating Slide 14: Golden Circle..."
    $s14 = $presentation.Slides.Add(14, 12)
    Set-SlideBg $s14 $cCream
    Add-Header $s14 "14. GOLDEN CIRCLE"

    $gc1 = $s14.Shapes.AddShape(1, 60, 140, 260, 300)
    $gc1.Fill.Solid(); $gc1.Fill.ForeColor.RGB = $cPurple
    $gc1.TextFrame.TextRange.Text = "WHY`n`nKami percaya setiap orang berhak merasa percaya diri dalam setiap proses bertumbuh."
    $gc1.TextFrame.TextRange.Font.Color.RGB = $cWhite; $gc1.TextFrame.TextRange.Font.Size = 14

    $gc2 = $s14.Shapes.AddShape(1, 340, 140, 260, 300)
    $gc2.Fill.Solid(); $gc2.Fill.ForeColor.RGB = $cGold
    $gc2.TextFrame.TextRange.Text = "HOW`n`nMelalui modest fashion yang nyaman, berkualitas, dan dirancang untuk kehidupan sehari-hari."
    $gc2.TextFrame.TextRange.Font.Color.RGB = $cDarkText; $gc2.TextFrame.TextRange.Font.Size = 14

    $gc3 = $s14.Shapes.AddShape(1, 620, 140, 260, 300)
    $gc3.Fill.Solid(); $gc3.Fill.ForeColor.RGB = $cWhite; $gc3.Line.Color.RGB = $cPurple
    $gc3.TextFrame.TextRange.Text = "WHAT`n`nPremium modest fashion untuk muslim modern."
    $gc3.TextFrame.TextRange.Font.Color.RGB = $cPurple; $gc3.TextFrame.TextRange.Font.Size = 14

    # SLIDE 15: Satu Kalimat Untuk Semua Tim (Dark)
    Write-Host "Creating Slide 15: North Star Statement..."
    $s15 = $presentation.Slides.Add(15, 12)
    Set-SlideBg $s15 $cPurple
    Add-Header $s15 "15. SATU KALIMAT UNTUK SEMUA TIM" $true

    $t15 = $s15.Shapes.AddTextbox(1, 100, 100, 760, 50)
    $t15.TextFrame.TextRange.Text = "Prinsip Utama Seluruh Tim Hijafera"
    $t15.TextFrame.TextRange.Font.Name = "Georgia"
    $t15.TextFrame.TextRange.Font.Size = 28
    $t15.TextFrame.TextRange.Font.Bold = 1
    $t15.TextFrame.TextRange.Font.Color.RGB = $cGold

    $q15 = $s15.Shapes.AddShape(1, 80, 170, 800, 270)
    $q15.Fill.Solid(); $q15.Fill.ForeColor.RGB = RGB 65 30 125
    $q15.Line.Color.RGB = $cGold; $q15.Line.Weight = 3
    $q15.TextFrame.TextRange.Text = """Setiap desain, foto, video, caption, iklan, hingga pelayanan Hijafera harus membuat pelanggan merasa lebih fresh, lebih percaya diri, lebih nyaman, dan berani bertumbuh."""
    $q15.TextFrame.TextRange.Font.Name = "Georgia"
    $q15.TextFrame.TextRange.Font.Size = 24
    $q15.TextFrame.TextRange.Font.Italic = 1
    $q15.TextFrame.TextRange.Font.Color.RGB = $cWhite

    # Save presentation
    Write-Host "Saving presentation to $pptxPath ..."
    $presentation.SaveAs($pptxPath)
    Write-Host "SUCCESS: PPTX file created at $pptxPath"

} catch {
    Write-Host "Error during PPTX generation: $_"
}
