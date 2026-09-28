# PowerShell script to create native .pptx (OpenXML) without requiring Microsoft Office installed

Add-Type -AssemblyName System.IO.Compression.FileSystem

$outputPptx = "c:\Users\UsEr\Documents\Hijafera\API Trigger\HIJAFERA_BRAND_DNA.pptx"
$tempDir = [System.IO.Path]::Combine([System.IO.Path]::GetTempPath(), "HijaferaPPTX_" + [Guid]::NewGuid().ToString("N"))

try {
    Write-Host "Creating OpenXML PowerPoint structure in $tempDir ..."
    New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
    New-Item -ItemType Directory -Path "$tempDir\_rels" -Force | Out-Null
    New-Item -ItemType Directory -Path "$tempDir\ppt" -Force | Out-Null
    New-Item -ItemType Directory -Path "$tempDir\ppt\_rels" -Force | Out-Null
    New-Item -ItemType Directory -Path "$tempDir\ppt\slides" -Force | Out-Null
    New-Item -ItemType Directory -Path "$tempDir\ppt\slides\_rels" -Force | Out-Null
    New-Item -ItemType Directory -Path "$tempDir\ppt\slideLayouts" -Force | Out-Null
    New-Item -ItemType Directory -Path "$tempDir\ppt\slideMasters" -Force | Out-Null
    New-Item -ItemType Directory -Path "$tempDir\ppt\theme" -Force | Out-Null

    # 1. [Content_Types].xml
    $contentTypes = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>
  <Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
  <Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
'@
    for ($i = 1; $i -le 15; $i++) {
        $contentTypes += "`n  <Override PartName=""/ppt/slides/slide$i.xml"" ContentType=""application/vnd.openxmlformats-officedocument.presentationml.slide+xml""/>"
    }
    $contentTypes += "`n</Types>"
    [System.IO.File]::WriteAllText("$tempDir\[Content_Types].xml", $contentTypes, [System.Text.Encoding]::UTF8)

    # 2. _rels/.rels
    $dotRels = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>
'@
    [System.IO.File]::WriteAllText("$tempDir\_rels\.rels", $dotRels, [System.Text.Encoding]::UTF8)

    # 3. ppt/_rels/presentation.xml.rels
    $presRels = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>
'@
    for ($i = 1; $i -le 15; $i++) {
        $idNum = $i + 1
        $presRels += "`n  <Relationship Id=""rId$idNum"" Type=""http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide"" Target=""slides/slide$i.xml""/>"
    }
    $presRels += "`n</Relationships>"
    [System.IO.File]::WriteAllText("$tempDir\ppt\_rels\presentation.xml.rels", $presRels, [System.Text.Encoding]::UTF8)

    # 4. ppt/presentation.xml
    $presXml = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldMasterIdLst>
    <p:sldMasterId id="2147483648" r:id="rId1"/>
  </p:sldMasterIdLst>
  <p:sldIdLst>
'@
    for ($i = 1; $i -le 15; $i++) {
        $idNum = $i + 1
        $sldId = 255 + $i
        $presXml += "`n    <p:sldId id=""$sldId"" r:id=""rId$idNum""/>"
    }
    $presXml += @'

  </p:sldIdLst>
  <p:sldSz cx="12192000" cy="6858000"/>
  <p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>
'@
    [System.IO.File]::WriteAllText("$tempDir\ppt\presentation.xml", $presXml, [System.Text.Encoding]::UTF8)

    # 5. Theme1.xml
    $themeXml = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Hijafera Theme">
  <a:themeElements>
    <a:clrScheme name="Hijafera">
      <a:dk1><a:srgbClr val="2A2438"/></a:dk1>
      <a:lt1><a:srgbClr val="FBF3EA"/></a:lt1>
      <a:dk2><a:srgbClr val="51269A"/></a:dk2>
      <a:lt2><a:srgbClr val="FFFFFF"/></a:lt2>
      <a:accent1><a:srgbClr val="DBB15A"/></a:accent1>
      <a:accent2><a:srgbClr val="51269A"/></a:accent2>
      <a:accent3><a:srgbClr val="6E3BBD"/></a:accent3>
      <a:accent4><a:srgbClr val="FBF3EA"/></a:accent4>
      <a:accent5><a:srgbClr val="371869"/></a:accent5>
      <a:accent6><a:srgbClr val="D5A23C"/></a:accent6>
      <a:hlink><a:srgbClr val="DBB15A"/></a:hlink>
      <a:folHlink><a:srgbClr val="6E3BBD"/></a:folHlink>
    </a:clrScheme>
    <a:fontScheme name="Hijafera Font">
      <a:majorFont><a:latin typeface="Georgia"/></a:majorFont>
      <a:minorFont><a:latin typeface="Arial"/></a:minorFont>
    </a:fontScheme>
    <a:fmtScheme name="Office">
      <a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst>
      <a:lnStyleLst><a:ln w="9525"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst>
      <a:effectStyleLst><a:effectLst/></a:effectStyleLst>
      <a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst>
    </a:fmtScheme>
  </a:themeElements>
</a:theme>
'@
    [System.IO.File]::WriteAllText("$tempDir\ppt\theme\theme1.xml", $themeXml, [System.Text.Encoding]::UTF8)

    # 6. slideMaster1.xml & rels
    $masterXml = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr/>
    </p:spTree>
  </p:cSld>
  <p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>
  <p:sldLayoutIdLst>
    <p:sldLayoutId id="2147483649" r:id="rId1"/>
  </p:sldLayoutIdLst>
</p:sldMaster>
'@
    [System.IO.File]::WriteAllText("$tempDir\ppt\slideMasters\slideMaster1.xml", $masterXml, [System.Text.Encoding]::UTF8)

    $masterRels = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/>
</Relationships>
'@
    New-Item -ItemType Directory -Path "$tempDir\ppt\slideMasters\_rels" -Force | Out-Null
    [System.IO.File]::WriteAllText("$tempDir\ppt\slideMasters\_rels\slideMaster1.xml.rels", $masterRels, [System.Text.Encoding]::UTF8)

    # 7. slideLayout1.xml & rels
    $layoutXml = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank">
  <p:cSld name="Blank">
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr/>
    </p:spTree>
  </p:cSld>
</p:sldLayout>
'@
    [System.IO.File]::WriteAllText("$tempDir\ppt\slideLayouts\slideLayout1.xml", $layoutXml, [System.Text.Encoding]::UTF8)

    $layoutRels = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>
</Relationships>
'@
    New-Item -ItemType Directory -Path "$tempDir\ppt\slideLayouts\_rels" -Force | Out-Null
    [System.IO.File]::WriteAllText("$tempDir\ppt\slideLayouts\_rels\slideLayout1.xml.rels", $layoutRels, [System.Text.Encoding]::UTF8)

    # Function to generate Slide XML
    function Build-SlideXml($title, $subtitle, $bgColorHex, $textColorHex, $badgeText, $bodyText) {
        $xml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:bg>
      <p:bgPr>
        <a:solidFill><a:srgbClr val="$bgColorHex"/></a:solidFill>
      </p:bgPr>
    </p:bg>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr/>
      
      <!-- Badge -->
      <p:sp>
        <p:nvSpPr><p:cNvPr id="2" name="Badge"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="457200" y="304800"/><a:ext cx="2743200" cy="355600"/></a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
          <a:solidFill><a:srgbClr val="DBB15A"/></a:solidFill>
        </p:spPr>
        <p:txBody>
          <a:bodyPr lIns="91440" tIns="45720" rIns="91440" bIns="45720" anchor="ctr"/>
          <a:p><a:r><a:rPr lang="id-ID" sz="1100" b="1"><a:solidFill><a:srgbClr val="51269A"/></a:solidFill></a:rPr><a:t>$badgeText</a:t></a:r></a:p>
        </p:txBody>
      </p:sp>

      <!-- Logo -->
      <p:sp>
        <p:nvSpPr><p:cNvPr id="3" name="Logo"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="9601200" y="304800"/><a:ext cx="2133600" cy="355600"/></a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
        </p:spPr>
        <p:txBody>
          <a:bodyPr anchor="ctr"/>
          <a:p><a:r><a:rPr lang="id-ID" sz="1600" b="1"><a:solidFill><a:srgbClr val="DBB15A"/></a:solidFill></a:rPr><a:t>HIJAFERA</a:t></a:r></a:p>
        </p:txBody>
      </p:sp>

      <!-- Title -->
      <p:sp>
        <p:nvSpPr><p:cNvPr id="4" name="Title"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="609600" y="914400"/><a:ext cx="10972800" cy="914400"/></a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:p><a:r><a:rPr lang="id-ID" sz="3600" b="1"><a:solidFill><a:srgbClr val="$textColorHex"/></a:solidFill></a:rPr><a:t>$title</a:t></a:r></a:p>
        </p:txBody>
      </p:sp>

      <!-- Body Content Box -->
      <p:sp>
        <p:nvSpPr><p:cNvPr id="5" name="Content"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="609600" y="1981200"/><a:ext cx="10972800" cy="4267200"/></a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
          <a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill>
          <a:ln w="19050"><a:solidFill><a:srgbClr val="DBB15A"/></a:solidFill></a:ln>
        </p:spPr>
        <p:txBody>
          <a:bodyPr lIns="274320" tIns="274320" rIns="274320" bIns="274320"/>
"@
        $lines = $bodyText -split "`n"
        foreach ($line in $lines) {
            $escaped = [System.Security.SecurityElement]::Escape($line)
            $xml += "`n          <a:p><a:r><a:rPr lang=""id-ID"" sz=""1800""><a:solidFill><a:srgbClr val=""2A2438""/></a:solidFill></a:rPr><a:t>$escaped</a:t></a:r></a:p>"
        }

        $xml += @"

        </p:txBody>
      </p:sp>

    </p:spTree>
  </p:cSld>
</p:sld>
"@
        return $xml
    }

    # Data for 15 slides
    $slidesData = @(
        @{ Title = "HIJAFERA"; Badge = "BRAND DNA"; Bg = "51269A"; Text = "DBB15A"; Body = "Modest with Confidence`n`nOfficial Brand Strategy & Guidelines Presentation`nELEGANT • MODERN • COMFORTABLE • TIMELESS • CONFIDENT • GROWTH" },
        @{ Title = "Mengapa Hijafera Ada?"; Badge = "01. OUR PURPOSE"; Bg = "FBF3EA"; Text = "51269A"; Body = "Kami hadir untuk menemani muslim modern agar berani bertumbuh setiap hari melalui modest fashion yang nyaman, modern, dan membuat mereka lebih percaya diri.`n`nKami tidak sekadar membuat pakaian. Kami menciptakan rasa percaya diri untuk menemani setiap langkah kehidupan." },
        @{ Title = "Visi Masa Depan Hijafera"; Badge = "02. OUR VISION"; Bg = "51269A"; Text = "DBB15A"; Body = "Menjadi Modern Modest Fashion House dari Indonesia yang menginspirasi jutaan muslim di Asia Tenggara untuk tampil percaya diri dalam setiap fase kehidupan." },
        @{ Title = "5 Misi Utama Hijafera"; Badge = "03. OUR MISSION"; Bg = "FBF3EA"; Text = "51269A"; Body = "1. Kualitas Premium: Menghadirkan modest fashion premium dengan kualitas terbaik.`n2. Fresh & Modern: Mendesain produk yang membuat pemakainya terlihat lebih fresh, modern, dan percaya diri.`n3. Material Nyaman: Menggunakan material yang ringan, nyaman, dan tidak mudah membuat gerah.`n4. Teman Perjalanan: Menjadi teman perjalanan pelanggan dalam setiap proses bertumbuh.`n5. Komunitas: Membangun komunitas yang saling menginspirasi melalui gerakan Berani Bertumbuh." },
        @{ Title = "BERANI BERTUMBUH"; Badge = "04. OUR MOVEMENT"; Bg = "FBF3EA"; Text = "51269A"; Body = "Kami percaya bahwa setiap orang sedang berada dalam proses:`n- Ada yang sedang membangun karier.`n- Ada yang baru menikah.`n- Ada yang sedang kuliah.`n- Ada yang sedang membangun bisnis.`n- Ada yang sedang menjadi versi terbaik dirinya.`n`nHijafera hadir untuk menemani perjalanan tersebut." },
        @{ Title = "Modest with Confidence"; Badge = "05 & 06. TAGLINE & ESSENCE"; Bg = "51269A"; Text = "DBB15A"; Body = "05. TAGLINE: Modest with Confidence`n`n06. BRAND ESSENCE: Quiet Confidence`n- Percaya diri tanpa perlu berlebihan.`n- Elegan tanpa harus menarik perhatian.`n- Nyaman menjadi diri sendiri." },
        @{ Title = "Janji Brand Kepada Pelanggan"; Badge = "07. BRAND PROMISE"; Bg = "FBF3EA"; Text = "51269A"; Body = "[+] Membuat pelanggan terlihat lebih fresh.`n[+] Memberikan kesan lebih proporsional melalui desain dan siluet.`n[+] Nyaman dipakai dari pagi hingga malam.`n[+] Memberikan rasa percaya diri dalam setiap aktivitas." },
        @{ Title = "Transformasi Pelanggan"; Badge = "08. CUSTOMER TRANSFORMATION"; Bg = "FBF3EA"; Text = "51269A"; Body = "SEBELUM MEMAKAI HIJAFERA:`n- Bingung memilih outfit. - Takut terlihat tua. - Takut kurang proporsional. - Tidak nyaman / bahan panas.`n`nSETELAH MEMAKAI HIJAFERA:`n- Terlihat lebih fresh & modern. - Lebih percaya diri. - Nyaman sepanjang hari. - Siap menjalani aktivitas." },
        @{ Title = "7 Nilai Utama Brand"; Badge = "09. BRAND VALUES"; Bg = "FBF3EA"; Text = "51269A"; Body = "CONFIDENCE: Percaya diri menjadi diri sendiri.`nCOMFORT: Nyaman dipakai setiap hari.`nELEGANCE: Sederhana namun berkelas.`nTIMELESS: Tidak mengikuti tren sesaat.`nEXCELLENCE: Detail kecil menentukan kualitas besar.`nGROWTH: Selalu bertumbuh bersama pelanggan.`nINTEGRITY: Jujur dalam produk, pelayanan, dan komunikasi." },
        @{ Title = "Personalitas Brand"; Badge = "10. BRAND PERSONALITY"; Bg = "51269A"; Text = "DBB15A"; Body = "Karakter Hijafera:`n`nElegan + Modern + Hangat + Optimis`n`nDewasa + Berkelas + Inspiratif + Bersahabat" },
        @{ Title = "Arah Visual: Warna & Mood"; Badge = "11. VISUAL DIRECTION"; Bg = "FBF3EA"; Text = "51269A"; Body = "Palette Warna:`n- Deep Purple (#51269A)`n- Gold (#DBB15A)`n- Warm Cream (#FBF3EA)`n- White (#FFFFFF)`n`nMoodboard:`nPremium • Editorial • Luxury • Clean • Natural • Soft Lighting • Minimal • Timeless" },
        @{ Title = "Prinsip Desain Produk"; Badge = "12. DESIGN PRINCIPLE"; Bg = "FBF3EA"; Text = "51269A"; Body = "Semua produk Hijafera harus membuat pelanggan merasa:`n- Lebih muda.`n- Lebih fresh.`n- Lebih percaya diri.`n- Lebih nyaman.`n- Tidak terasa gerah.`n- Mudah dipadukan.`n- Cocok dipakai setiap hari." },
        @{ Title = "Gaya Bahasa & Komunikasi"; Badge = "13. BRAND VOICE"; Bg = "FBF3EA"; Text = "51269A"; Body = "HAL YANG HARUS DIHINDARI:`n- Jangan terdengar seperti marketplace.`n- Jangan terdengar seperti sedang hard selling.`n`nGUNAKAN BAHASA YANG:`n- Hangat - Elegan - Optimis - Menenangkan - Memberikan semangat" },
        @{ Title = "Golden Circle"; Badge = "14. GOLDEN CIRCLE"; Bg = "FBF3EA"; Text = "51269A"; Body = "WHY: Kami percaya setiap orang berhak merasa percaya diri dalam setiap proses bertumbuh.`n`nHOW: Melalui modest fashion yang nyaman, berkualitas, dan dirancang untuk kehidupan sehari-hari.`n`nWHAT: Premium modest fashion untuk muslim modern." },
        @{ Title = "Satu Kalimat Untuk Semua Tim"; Badge = "15. NORTH STAR"; Bg = "51269A"; Text = "DBB15A"; Body = """Setiap desain, foto, video, caption, iklan, hingga pelayanan Hijafera harus membuat pelanggan merasa lebih fresh, lebih percaya diri, lebih nyaman, dan berani bertumbuh.""" }
    )

    for ($i = 0; $i -lt 15; $i++) {
        $slideIndex = $i + 1
        $d = $slidesData[$i]
        $slideXml = Build-SlideXml -title $d.Title -subtitle "" -bgColorHex $d.Bg -textColorHex $d.Text -badgeText $d.Badge -bodyText $d.Body
        [System.IO.File]::WriteAllText("$tempDir\ppt\slides\slide$slideIndex.xml", $slideXml, [System.Text.Encoding]::UTF8)

        $slideRels = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>
'@
        [System.IO.File]::WriteAllText("$tempDir\ppt\slides\_rels\slide$slideIndex.xml.rels", $slideRels, [System.Text.Encoding]::UTF8)
    }

    Write-Host "Zipping OpenXML package to $outputPptx ..."
    if (Test-Path $outputPptx) { Remove-Item $outputPptx -Force }
    
    [System.IO.Compression.ZipFile]::CreateFromDirectory($tempDir, $outputPptx)
    Write-Host "SUCCESS: Generated native PPTX presentation file at: $outputPptx"

} catch {
    Write-Host "Error generating OpenXML PPTX: $_"
} finally {
    if (Test-Path $tempDir) {
        Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}
