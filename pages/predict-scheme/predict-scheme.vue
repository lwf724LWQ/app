<template>
  <view class="scheme-container">
    <!-- 导航栏 -->
    <view class="navbar">
      <view class="nav-content">
        <view class="nav-left" @click="goBack">
          <text class="back-arrow">‹</text>
        </view>
        <text class="nav-title">{{ isAppendMode ? '追帖方案' : '设置方案' }}</text>
        <view class="nav-right"></view>
      </view>
    </view>
    
    <!-- 追帖模式提示 -->
    <view v-if="isAppendMode && appendPostData" class="append-mode-tip">
      <view class="tip-content">
        <uni-icons type="info" size="16" color="#28B389"></uni-icons>
        <text class="tip-text">追帖模式：为帖子"第{{ appendPostData.period }}期"追加方案</text>
      </view>
    </view>
    
    <!-- 主要内容区域 -->
    <view class="main-content">
      <!-- 左侧导航菜单 -->
      <view class="sidebar">
        <scroll-view scroll-y class="menu-scroll">
          <view 
            class="menu-item" 
            :class="{ 
              active: activeScheme === scheme.id,
              published: isSchemePublished(scheme.id),
              disabled: !isFromPatternPredict && isSchemePublished(scheme.id)
            }"
            v-for="scheme in schemeList" 
            :key="scheme.id"
            @click="selectScheme(scheme.id)"
          >
            <text class="menu-text">{{ scheme.name }}</text>
            <view class="menu-icons">
            <uni-icons v-if="activeScheme === scheme.id" type="checkmarkempty" size="16" color="#ff4757"></uni-icons>
              <uni-icons v-if="isSchemePublished(scheme.id)" type="checkmarkempty" size="16" color="#28B389"></uni-icons>
            </view>
          </view>
          <!-- 底部标签 -->
          <view class="menu-footer">
            <text class="footer-text">方案列表</text>
            <!-- 测试按钮 -->
            <view class="test-buttons">
              <button class="test-btn" @click="testPublishedScheme">获取已发布</button>
              <button class="test-btn" @click="clearTestData">清除数据</button>
            </view>
          </view>
        </scroll-view>
      </view>
      
      <!-- 右侧配置区域 -->
      <view class="config-area">
        <!-- 二字现特殊选择区域 -->
        <view v-if="activeScheme === '二字现'" class="combination-section">
          <view class="digit-label">
            <text class="label-text">任选二</text>
            <text class="limit-text">最多选4组</text>
          </view>
          <view class="sequence-tip" v-if="getSequenceStatus()">
            <text class="tip-text">{{ getSequenceStatus() }}</text>
          </view>
          <view class="number-grid">
            <view 
              class="number-item"
              v-for="num in 10" 
              :key="num"
              @click="toggleNumber('combination', num)"
            >
              <text class="number-text">{{ num - 1 }}</text>
            </view>
          </view>
        </view>
        
        <!-- 三字现特殊选择区域 -->
        <view v-if="activeScheme === '三字现'" class="combination-section">
          <view class="digit-label">
            <text class="label-text">任选三</text>
            <text class="limit-text">最多选15组</text>
          </view>
          <view class="sequence-tip" v-if="getSequenceStatus()">
            <text class="tip-text">{{ getSequenceStatus() }}</text>
          </view>
          <view class="number-grid">
            <view 
              class="number-item"
              v-for="num in 10" 
              :key="num"
              @click="toggleNumber('combination', num)"
            >
              <text class="number-text">{{ num - 1 }}</text>
            </view>
          </view>
        </view>
        
        <!-- 千位选择 -->
        <view v-if="activeScheme !== '二字现' && activeScheme !== '三字现' && currentSchemeDigits.includes('thousands')" class="digit-section">
          <view class="digit-label">
            <text class="label-text">{{ activeScheme === '头尾合' ? '头尾合' : (activeScheme === '千百合' ? '千百合' : (activeScheme === '千十合' ? '千十合' : '千位')) }}</text>
            <text class="limit-text">{{ (activeScheme === '杀头' || activeScheme === '杀百' || activeScheme === '杀十' || activeScheme === '杀尾' || activeScheme === '稳码') ? '最多选2个' : '最多选6个' }}</text>
          </view>
          <view class="number-grid">
            <view 
              class="number-item" 
              :class="{ selected: selectedThousands.includes(num - 1) }"
              v-for="num in 10" 
              :key="num"
              @click="toggleNumber('thousands', num)"
            >
              <text class="number-text">{{ num - 1 }}</text>
            </view>
          </view>
          <!-- 主攻按钮 -->
          <view v-if="shouldShowMainAttack('thousands')" class="main-attack-btn" @click="showMainAttack('thousands')">
            <text class="main-attack-text">主攻?</text>
          </view>
          <!-- 重点按钮 -->
          <view v-if="shouldShowKeyPoint('thousands')" class="key-point-btn" @click="showKeyPoint('thousands')">
            <text class="key-point-text">重点?</text>
          </view>
        </view>
        
        <!-- 百位选择 -->
        <view v-if="activeScheme !== '二字现' && activeScheme !== '三字现' && currentSchemeDigits.includes('hundreds')" class="digit-section">
          <view class="digit-label">
            <text class="label-text">{{ activeScheme === '中肚合' ? '中肚合' : (activeScheme === '千百合' ? '千百合' : (activeScheme === '百个合' ? '百个合' : '百位')) }}</text>
            <text class="limit-text">{{ (activeScheme === '杀头' || activeScheme === '杀百' || activeScheme === '杀十' || activeScheme === '杀尾' || activeScheme === '稳码') ? '最多选2个' : '最多选6个' }}</text>
          </view>
          <view class="number-grid">
            <view 
              class="number-item" 
              :class="{ selected: selectedHundreds.includes(num - 1) }"
              v-for="num in 10" 
              :key="num"
              @click="toggleNumber('hundreds', num)"
            >
              <text class="number-text">{{ num - 1 }}</text>
            </view>
          </view>
          <!-- 主攻按钮 -->
          <view v-if="shouldShowMainAttack('hundreds')" class="main-attack-btn" @click="showMainAttack('hundreds')">
            <text class="main-attack-text">主攻?</text>
          </view>
          <!-- 重点按钮 -->
          <view v-if="shouldShowKeyPoint('hundreds')" class="key-point-btn" @click="showKeyPoint('hundreds')">
            <text class="key-point-text">重点?</text>
          </view>
        </view>
        
        <!-- 十位选择 -->
        <view v-if="activeScheme !== '二字现' && activeScheme !== '三字现' && activeScheme !== '定头' && activeScheme !== '定百' && activeScheme !== '杀百' && currentSchemeDigits.includes('tens')" class="digit-section">
          <view class="digit-label">
            <text class="label-text">{{ activeScheme === '中肚合' ? '中肚合' : (activeScheme === '十个合' ? '十个合' : '十位') }}</text>
            <text class="limit-text">{{ (activeScheme === '杀头' || activeScheme === '杀百' || activeScheme === '杀十' || activeScheme === '杀尾' || activeScheme === '稳码') ? '最多选2个' : '最多选6个' }}</text>
          </view>
          <view class="number-grid">
            <view 
              class="number-item" 
              :class="{ selected: selectedTens.includes(num - 1) }"
              v-for="num in 10" 
              :key="num"
              @click="toggleNumber('tens', num)"
            >
              <text class="number-text">{{ num - 1 }}</text>
            </view>
          </view>
          <!-- 主攻按钮 -->
          <view v-if="shouldShowMainAttack('tens')" class="main-attack-btn" @click="showMainAttack('tens')">
            <text class="main-attack-text">主攻?</text>
          </view>
          <!-- 重点按钮 -->
          <view v-if="shouldShowKeyPoint('tens')" class="key-point-btn" @click="showKeyPoint('tens')">
            <text class="key-point-text">重点?</text>
          </view>
        </view>
        
        <!-- 个位选择 -->
        <view v-if="activeScheme !== '二字现' && activeScheme !== '三字现' && activeScheme !== '定头' && activeScheme !== '定百' && activeScheme !== '杀百' && activeScheme !== '杀十' && currentSchemeDigits.includes('units')" class="digit-section">
          <view class="digit-label">
            <text class="label-text">{{ 
              activeScheme === '稳码' ? '' : 
              activeScheme === '头尾合' ? '头尾合' : 
              activeScheme === '死数' ? '死数' : 
              activeScheme === '头尾不合' ? '头尾不合' :
              activeScheme === '中肚不合' ? '中肚不合' :
              activeScheme === '千百不合' ? '千百不合' :
              activeScheme === '千十不合' ? '千十不合' :
              activeScheme === '百个不合' ? '百个不合' :
              activeScheme === '十个不合' ? '十个不合' : '个位'
            }}</text>
            <text class="limit-text">{{ (activeScheme === '杀头' || activeScheme === '杀百' || activeScheme === '杀十' || activeScheme === '杀尾' || activeScheme === '稳码' || activeScheme === '头尾不合' || activeScheme === '中肚不合' || activeScheme === '千百不合' || activeScheme === '千十不合' || activeScheme === '百个不合' || activeScheme === '十个不合') ? '最多选2个' : (activeScheme === '死数' ? '只选1个' : '最多选6个') }}</text>
          </view>
          <view class="number-grid">
            <view 
              class="number-item" 
              :class="{ selected: selectedUnits.includes(num - 1) }"
              v-for="num in 10" 
              :key="num"
              @click="toggleNumber('units', num)"
            >
              <text class="number-text">{{ num - 1 }}</text>
            </view>
          </view>
          <!-- 主攻按钮 -->
          <view v-if="shouldShowMainAttack('units')" class="main-attack-btn" @click="showMainAttack('units')">
            <text class="main-attack-text">主攻?</text>
          </view>
          <!-- 重点按钮 -->
          <view v-if="shouldShowKeyPoint('units')" class="key-point-btn" @click="showKeyPoint('units')">
            <text class="key-point-text">重点?</text>
          </view>
        </view>
        
        <!-- 方案预览 -->
        <view class="scheme-preview">
          <text class="preview-text">[{{ currentSchemeName }}]</text>
          <!-- 二字现特殊显示 -->
          <text v-if="activeScheme === '二字现'" class="preview-text">组合: {{ formatCombinations(selectedCombinations) || '未选择' }}</text>
          <!-- 三字现特殊显示 -->
          <text v-if="activeScheme === '三字现'" class="preview-text">组合: {{ formatCombinations(selectedCombinations) || '未选择' }}</text>
          <!-- 其他方案显示 -->
          <text v-if="activeScheme !== '二字现' && activeScheme !== '三字现' && activeScheme !== '头尾合' && activeScheme !== '千百合' && activeScheme !== '千十合' && currentSchemeDigits.includes('thousands')" class="preview-text">千位: {{ selectedThousands.join('') || '未选择' }}</text>
          <text v-if="activeScheme !== '二字现' && activeScheme !== '三字现' && activeScheme !== '头尾合' && activeScheme !== '千百合' && activeScheme !== '千十合' && currentSchemeDigits.includes('thousands') && schemeData[activeScheme]?.thousandsMainAttack" class="preview-text">主{{ schemeData[activeScheme].thousandsMainAttack.join('') }}</text>
          <text v-if="activeScheme !== '二字现' && activeScheme !== '三字现' && activeScheme !== '头尾合' && activeScheme !== '千百合' && activeScheme !== '千十合' && currentSchemeDigits.includes('thousands') && schemeData[activeScheme]?.thousandsKeyPoint" class="preview-text">重{{ schemeData[activeScheme].thousandsKeyPoint.join('') }}</text>
          <!-- 定头方案显示 -->
          <text v-if="activeScheme === '定头' && selectedThousands.length > 0" class="preview-text">千位: {{ selectedThousands.join('') }}</text>
          <text v-if="activeScheme === '定头' && schemeData[activeScheme]?.mainAttack" class="preview-text">主{{ schemeData[activeScheme].mainAttack.join('') }}</text>
          <text v-if="activeScheme === '定头' && schemeData[activeScheme]?.keyPoint" class="preview-text">重{{ schemeData[activeScheme].keyPoint.join('') }}</text>
          <!-- 定百方案显示 -->
          <text v-if="activeScheme === '定百' && selectedHundreds.length > 0" class="preview-text">百位: {{ selectedHundreds.join('') }}</text>
          <text v-if="activeScheme === '定百' && schemeData[activeScheme]?.mainAttack" class="preview-text">主{{ schemeData[activeScheme].mainAttack.join('') }}</text>
          <text v-if="activeScheme === '定百' && schemeData[activeScheme]?.keyPoint" class="preview-text">重{{ schemeData[activeScheme].keyPoint.join('') }}</text>
          <!-- 定十方案显示 -->
          <text v-if="activeScheme === '定十' && selectedTens.length > 0" class="preview-text">十位: {{ selectedTens.join('') }}</text>
          <text v-if="activeScheme === '定十' && schemeData[activeScheme]?.mainAttack" class="preview-text">主{{ schemeData[activeScheme].mainAttack.join('') }}</text>
          <text v-if="activeScheme === '定十' && schemeData[activeScheme]?.keyPoint" class="preview-text">重{{ schemeData[activeScheme].keyPoint.join('') }}</text>
          <!-- 定尾方案显示 -->
          <text v-if="activeScheme === '定尾' && selectedUnits.length > 0" class="preview-text">个位: {{ selectedUnits.join('') }}</text>
          <text v-if="activeScheme === '定尾' && schemeData[activeScheme]?.mainAttack" class="preview-text">主{{ schemeData[activeScheme].mainAttack.join('') }}</text>
          <text v-if="activeScheme === '定尾' && schemeData[activeScheme]?.keyPoint" class="preview-text">重{{ schemeData[activeScheme].keyPoint.join('') }}</text>
          <!-- 杀头方案显示 -->
          <text v-if="activeScheme === '杀头' && selectedThousands.length > 0" class="preview-text">千位: {{ selectedThousands.join('') }}</text>
          <!-- 杀百方案显示 -->
          <text v-if="activeScheme === '杀百' && selectedHundreds.length > 0" class="preview-text">百位: {{ selectedHundreds.join('') }}</text>
          <!-- 杀十方案显示 -->
          <text v-if="activeScheme === '杀十' && selectedTens.length > 0" class="preview-text">十位: {{ selectedTens.join('') }}</text>
          <!-- 杀尾方案显示 -->
          <text v-if="activeScheme === '杀尾' && selectedUnits.length > 0" class="preview-text">个位: {{ selectedUnits.join('') }}</text>
          <!-- 稳码方案显示 -->
          <text v-if="activeScheme === '稳码' && selectedUnits.length > 0" class="preview-text">稳码: {{ selectedUnits.join('') }}</text>
          <!-- 死数方案显示 -->
          <text v-if="activeScheme === '死数' && selectedUnits.length > 0" class="preview-text">死数: {{ selectedUnits.join('') }}</text>
          <!-- 头尾不合方案显示 -->
          <text v-if="activeScheme === '头尾不合' && selectedUnits.length > 0" class="preview-text">头尾不合: {{ selectedUnits.join('') }}</text>
          <!-- 中肚不合方案显示 -->
          <text v-if="activeScheme === '中肚不合' && selectedUnits.length > 0" class="preview-text">中肚不合: {{ selectedUnits.join('') }}</text>
          <!-- 千百不合方案显示 -->
          <text v-if="activeScheme === '千百不合' && selectedUnits.length > 0" class="preview-text">千百不合: {{ selectedUnits.join('') }}</text>
          <!-- 千十不合方案显示 -->
          <text v-if="activeScheme === '千十不合' && selectedUnits.length > 0" class="preview-text">千十不合: {{ selectedUnits.join('') }}</text>
          <!-- 百个不合方案显示 -->
          <text v-if="activeScheme === '百个不合' && selectedUnits.length > 0" class="preview-text">百个不合: {{ selectedUnits.join('') }}</text>
          <!-- 十个不合方案显示 -->
          <text v-if="activeScheme === '十个不合' && selectedUnits.length > 0" class="preview-text">十个不合: {{ selectedUnits.join('') }}</text>
          <!-- 头尾合方案显示 -->
          <text v-if="activeScheme === '头尾合' && (selectedThousands.length > 0 || selectedHundreds.length > 0 || selectedTens.length > 0 || selectedUnits.length > 0)" class="preview-text">{{ (selectedThousands.join('') + selectedHundreds.join('') + selectedTens.join('') + selectedUnits.join('')) || '未选择' }}</text>
          <text v-if="activeScheme === '头尾合' && schemeData[activeScheme]?.mainAttack" class="preview-text">主{{ schemeData[activeScheme].mainAttack.join('') }}</text>
          <text v-if="activeScheme === '头尾合' && schemeData[activeScheme]?.keyPoint" class="preview-text">重{{ schemeData[activeScheme].keyPoint.join('') }}</text>
          <!-- 中肚合方案显示 -->
          <text v-if="activeScheme === '中肚合' && (selectedThousands.length > 0 || selectedHundreds.length > 0 || selectedTens.length > 0 || selectedUnits.length > 0)" class="preview-text">{{ (selectedThousands.join('') + selectedHundreds.join('') + selectedTens.join('') + selectedUnits.join('')) || '未选择' }}</text>
          <text v-if="activeScheme === '中肚合' && schemeData[activeScheme]?.mainAttack" class="preview-text">主{{ schemeData[activeScheme].mainAttack.join('') }}</text>
          <text v-if="activeScheme === '中肚合' && schemeData[activeScheme]?.keyPoint" class="preview-text">重{{ schemeData[activeScheme].keyPoint.join('') }}</text>
          <!-- 千百合方案显示 -->
          <text v-if="activeScheme === '千百合' && (selectedThousands.length > 0 || selectedHundreds.length > 0 || selectedTens.length > 0 || selectedUnits.length > 0)" class="preview-text">{{ (selectedThousands.join('') + selectedHundreds.join('') + selectedTens.join('') + selectedUnits.join('')) || '未选择' }}</text>
          <text v-if="activeScheme === '千百合' && schemeData[activeScheme]?.mainAttack" class="preview-text">主{{ schemeData[activeScheme].mainAttack.join('') }}</text>
          <text v-if="activeScheme === '千百合' && schemeData[activeScheme]?.keyPoint" class="preview-text">重{{ schemeData[activeScheme].keyPoint.join('') }}</text>
          <!-- 千十合方案显示 -->
          <text v-if="activeScheme === '千十合' && (selectedThousands.length > 0 || selectedHundreds.length > 0 || selectedTens.length > 0 || selectedUnits.length > 0)" class="preview-text">{{ (selectedThousands.join('') + selectedHundreds.join('') + selectedTens.join('') + selectedUnits.join('')) || '未选择' }}</text>
          <text v-if="activeScheme === '千十合' && schemeData[activeScheme]?.mainAttack" class="preview-text">主{{ schemeData[activeScheme].mainAttack.join('') }}</text>
          <text v-if="activeScheme === '千十合' && schemeData[activeScheme]?.keyPoint" class="preview-text">重{{ schemeData[activeScheme].keyPoint.join('') }}</text>
          <!-- 百个合方案显示 -->
          <text v-if="activeScheme === '百个合' && (selectedThousands.length > 0 || selectedHundreds.length > 0 || selectedTens.length > 0 || selectedUnits.length > 0)" class="preview-text">{{ (selectedThousands.join('') + selectedHundreds.join('') + selectedTens.join('') + selectedUnits.join('')) || '未选择' }}</text>
          <text v-if="activeScheme === '百个合' && schemeData[activeScheme]?.mainAttack" class="preview-text">主{{ schemeData[activeScheme].mainAttack.join('') }}</text>
          <text v-if="activeScheme === '百个合' && schemeData[activeScheme]?.keyPoint" class="preview-text">重{{ schemeData[activeScheme].keyPoint.join('') }}</text>
          <!-- 十个合方案显示 -->
          <text v-if="activeScheme === '十个合' && (selectedThousands.length > 0 || selectedHundreds.length > 0 || selectedTens.length > 0 || selectedUnits.length > 0)" class="preview-text">{{ (selectedThousands.join('') + selectedHundreds.join('') + selectedTens.join('') + selectedUnits.join('')) || '未选择' }}</text>
          <text v-if="activeScheme === '十个合' && schemeData[activeScheme]?.mainAttack" class="preview-text">主{{ schemeData[activeScheme].mainAttack.join('') }}</text>
          <text v-if="activeScheme === '十个合' && schemeData[activeScheme]?.keyPoint" class="preview-text">重{{ schemeData[activeScheme].keyPoint.join('') }}</text>
          <text v-if="activeScheme !== '二字现' && activeScheme !== '三字现' && activeScheme !== '定头' && activeScheme !== '定百' && activeScheme !== '定十' && activeScheme !== '定尾' && activeScheme !== '杀头' && activeScheme !== '杀百' && activeScheme !== '杀十' && activeScheme !== '杀尾' && activeScheme !== '稳码' && activeScheme !== '死数' && activeScheme !== '头尾不合' && activeScheme !== '中肚不合' && activeScheme !== '千百不合' && activeScheme !== '千十不合' && activeScheme !== '百个不合' && activeScheme !== '十个不合' && activeScheme !== '头尾合' && activeScheme !== '中肚合' && activeScheme !== '千百合' && activeScheme !== '千十合' && activeScheme !== '百个合' && activeScheme !== '十个合' && currentSchemeDigits.includes('hundreds')" class="preview-text">百位: {{ selectedHundreds.join('') || '未选择' }}</text>
          <text v-if="activeScheme !== '二字现' && activeScheme !== '三字现' && activeScheme !== '定头' && activeScheme !== '定百' && activeScheme !== '定十' && activeScheme !== '定尾' && activeScheme !== '杀头' && activeScheme !== '杀百' && activeScheme !== '杀十' && activeScheme !== '杀尾' && activeScheme !== '稳码' && activeScheme !== '死数' && activeScheme !== '头尾不合' && activeScheme !== '中肚不合' && activeScheme !== '千百不合' && activeScheme !== '千十不合' && activeScheme !== '百个不合' && activeScheme !== '十个不合' && activeScheme !== '头尾合' && activeScheme !== '中肚合' && activeScheme !== '千百合' && activeScheme !== '千十合' && activeScheme !== '百个合' && activeScheme !== '十个合' && currentSchemeDigits.includes('hundreds') && schemeData[activeScheme]?.hundredsMainAttack" class="preview-text">主{{ schemeData[activeScheme].hundredsMainAttack.join('') }}</text>
          <text v-if="activeScheme !== '二字现' && activeScheme !== '三字现' && activeScheme !== '定头' && activeScheme !== '定百' && activeScheme !== '定十' && activeScheme !== '定尾' && activeScheme !== '杀头' && activeScheme !== '杀百' && activeScheme !== '杀十' && activeScheme !== '杀尾' && activeScheme !== '稳码' && activeScheme !== '死数' && activeScheme !== '头尾不合' && activeScheme !== '中肚不合' && activeScheme !== '千百不合' && activeScheme !== '千十不合' && activeScheme !== '百个不合' && activeScheme !== '十个不合' && activeScheme !== '头尾合' && activeScheme !== '中肚合' && activeScheme !== '千百合' && activeScheme !== '千十合' && activeScheme !== '百个合' && activeScheme !== '十个合' && currentSchemeDigits.includes('hundreds') && schemeData[activeScheme]?.hundredsKeyPoint" class="preview-text">重{{ schemeData[activeScheme].hundredsKeyPoint.join('') }}</text>
          <text v-if="activeScheme !== '二字现' && activeScheme !== '三字现' && activeScheme !== '定头' && activeScheme !== '定百' && activeScheme !== '定十' && activeScheme !== '定尾' && activeScheme !== '杀头' && activeScheme !== '杀百' && activeScheme !== '杀十' && activeScheme !== '杀尾' && activeScheme !== '稳码' && activeScheme !== '死数' && activeScheme !== '头尾不合' && activeScheme !== '中肚不合' && activeScheme !== '千百不合' && activeScheme !== '千十不合' && activeScheme !== '百个不合' && activeScheme !== '十个不合' && activeScheme !== '头尾合' && activeScheme !== '中肚合' && activeScheme !== '千百合' && activeScheme !== '千十合' && activeScheme !== '百个合' && activeScheme !== '十个合' && currentSchemeDigits.includes('tens')" class="preview-text">十位: {{ selectedTens.join('') || '未选择' }}</text>
          <text v-if="activeScheme !== '二字现' && activeScheme !== '三字现' && activeScheme !== '定头' && activeScheme !== '定百' && activeScheme !== '定十' && activeScheme !== '定尾' && activeScheme !== '杀头' && activeScheme !== '杀百' && activeScheme !== '杀十' && activeScheme !== '杀尾' && activeScheme !== '稳码' && activeScheme !== '死数' && activeScheme !== '头尾不合' && activeScheme !== '中肚不合' && activeScheme !== '千百不合' && activeScheme !== '千十不合' && activeScheme !== '百个不合' && activeScheme !== '十个不合' && activeScheme !== '头尾合' && activeScheme !== '中肚合' && activeScheme !== '千百合' && activeScheme !== '千十合' && activeScheme !== '百个合' && activeScheme !== '十个合' && currentSchemeDigits.includes('tens') && schemeData[activeScheme]?.tensMainAttack" class="preview-text">主{{ schemeData[activeScheme].tensMainAttack.join('') }}</text>
          <text v-if="activeScheme !== '二字现' && activeScheme !== '三字现' && activeScheme !== '定头' && activeScheme !== '定百' && activeScheme !== '定十' && activeScheme !== '定尾' && activeScheme !== '杀头' && activeScheme !== '杀百' && activeScheme !== '杀十' && activeScheme !== '杀尾' && activeScheme !== '稳码' && activeScheme !== '死数' && activeScheme !== '头尾不合' && activeScheme !== '中肚不合' && activeScheme !== '千百不合' && activeScheme !== '千十不合' && activeScheme !== '百个不合' && activeScheme !== '十个不合' && activeScheme !== '头尾合' && activeScheme !== '中肚合' && activeScheme !== '千百合' && activeScheme !== '千十合' && activeScheme !== '百个合' && activeScheme !== '十个合' && currentSchemeDigits.includes('tens') && schemeData[activeScheme]?.tensKeyPoint" class="preview-text">重{{ schemeData[activeScheme].tensKeyPoint.join('') }}</text>
          <text v-if="activeScheme !== '二字现' && activeScheme !== '三字现' && activeScheme !== '定头' && activeScheme !== '定百' && activeScheme !== '定十' && activeScheme !== '定尾' && activeScheme !== '杀头' && activeScheme !== '杀百' && activeScheme !== '杀十' && activeScheme !== '杀尾' && activeScheme !== '稳码' && activeScheme !== '死数' && activeScheme !== '头尾不合' && activeScheme !== '中肚不合' && activeScheme !== '千百不合' && activeScheme !== '千十不合' && activeScheme !== '百个不合' && activeScheme !== '十个不合' && activeScheme !== '头尾合' && activeScheme !== '中肚合' && activeScheme !== '千百合' && activeScheme !== '千十合' && activeScheme !== '百个合' && activeScheme !== '十个合' && currentSchemeDigits.includes('units')" class="preview-text">个位: {{ selectedUnits.join('') || '未选择' }}</text>
          <text v-if="activeScheme !== '二字现' && activeScheme !== '三字现' && activeScheme !== '定头' && activeScheme !== '定百' && activeScheme !== '定十' && activeScheme !== '定尾' && activeScheme !== '杀头' && activeScheme !== '杀百' && activeScheme !== '杀十' && activeScheme !== '杀尾' && activeScheme !== '稳码' && activeScheme !== '死数' && activeScheme !== '头尾不合' && activeScheme !== '中肚不合' && activeScheme !== '千百不合' && activeScheme !== '千十不合' && activeScheme !== '百个不合' && activeScheme !== '十个不合' && activeScheme !== '头尾合' && activeScheme !== '中肚合' && activeScheme !== '千百合' && activeScheme !== '千十合' && activeScheme !== '百个合' && activeScheme !== '十个合' && currentSchemeDigits.includes('units') && schemeData[activeScheme]?.unitsMainAttack" class="preview-text">主{{ schemeData[activeScheme].unitsMainAttack.join('') }}</text>
          <text v-if="activeScheme !== '二字现' && activeScheme !== '三字现' && activeScheme !== '定头' && activeScheme !== '定百' && activeScheme !== '定十' && activeScheme !== '定尾' && activeScheme !== '杀头' && activeScheme !== '杀百' && activeScheme !== '杀十' && activeScheme !== '杀尾' && activeScheme !== '稳码' && activeScheme !== '死数' && activeScheme !== '头尾不合' && activeScheme !== '中肚不合' && activeScheme !== '千百不合' && activeScheme !== '千十不合' && activeScheme !== '百个不合' && activeScheme !== '十个不合' && activeScheme !== '头尾合' && activeScheme !== '中肚合' && activeScheme !== '千百合' && activeScheme !== '千十合' && activeScheme !== '百个合' && activeScheme !== '十个合' && currentSchemeDigits.includes('units') && schemeData[activeScheme]?.unitsKeyPoint" class="preview-text">重{{ schemeData[activeScheme].unitsKeyPoint.join('') }}</text>
        </view>
        
        <!-- 操作按钮 -->
        <view class="action-buttons">
          <button class="clear-btn" @click="clearScheme">清除方案</button>
          <button class="update-btn" @click="addScheme">添加方案</button>
        </view>
      </view>
    </view>
    
    <!-- 浮动发布按钮 -->
    <view class="floating-btn" @click="goToPublish">
      <text class="btn-text">去发布</text>
      <text class="btn-step">{{ publishButtonText }}</text>
    </view>
    
    
    <!-- 保存提示弹窗 -->
    <view v-if="showSaveDialog" class="save-dialog-mask" @click="dontSaveScheme">
      <view class="save-dialog" @click.stop>
        <text class="dialog-title">提示</text>
        <text class="dialog-message">[{{ currentSchemeName }}] 方案内容有更改,是否需要先保存?</text>
        <view class="dialog-buttons">
          <button class="dialog-btn cancel-btn" @click="dontSaveScheme">不保存</button>
          <button class="dialog-btn save-btn" @click="saveScheme">保存</button>
        </view>
      </view>
    </view>
    
    <!-- 主攻选择弹窗 -->
    <view v-if="showMainAttackDialog" class="main-attack-dialog-mask" @click="hideMainAttack">
      <view class="main-attack-dialog" @click.stop>
        <text class="dialog-title">{{ getMainAttackTitle() }}: 选择主攻</text>
        <view class="main-attack-numbers">
          <view 
            class="main-attack-number-item"
            :class="{ selected: isMainAttackSelected(num) }"
            v-for="num in mainAttackNumbers" 
            :key="num"
            @click="toggleMainAttackNumber(num)"
          >
            <text class="main-attack-number-text">{{ num }}</text>
          </view>
        </view>
        <view class="dialog-buttons">
          <button class="dialog-btn cancel-btn" @click="hideMainAttack">关闭</button>
          <button class="dialog-btn save-btn" @click="confirmMainAttack">确定</button>
        </view>
      </view>
    </view>
    
    <!-- 重点选择弹窗 -->
    <view v-if="showKeyPointDialog" class="main-attack-dialog-mask" @click="hideKeyPoint">
      <view class="main-attack-dialog" @click.stop>
        <text class="dialog-title">{{ getMainAttackTitle() }}: 选择重点</text>
        <view class="main-attack-numbers">
          <view 
            class="main-attack-number-item"
            :class="{ selected: isKeyPointSelected(num) }"
            v-for="num in keyPointNumbers" 
            :key="num"
            @click="toggleKeyPointNumber(num)"
          >
            <text class="main-attack-number-text">{{ num }}</text>
          </view>
        </view>
        <view class="dialog-buttons">
          <button class="dialog-btn cancel-btn" @click="hideKeyPoint">关闭</button>
          <button class="dialog-btn save-btn" @click="confirmKeyPoint">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { apiGetIssueNo, apiPostListQuery } from '@/api/apis.js'

// 当前选中的方案
const activeScheme = ref('AXCX')

// 彩票类型和期号相关
const lotteryTypes = ref([
  { id: 16, name: '排列三', code: 'pl3', status: '待开奖', time: '今天 21:30' },
  { id: 17, name: '排列五', code: 'pl5', status: '待开奖', time: '今天 21:30' },
  { id: 15, name: '七星彩', code: 'qxc', status: '待开奖', time: '今天 21:30' },
  { id: 12, name: '福彩3D', code: 'fc3d', status: '待开奖', time: '今天 21:30' }
])

// 当前选中的彩票类型
const currentLotteryType = ref(lotteryTypes.value[0])

// 当前期号信息
const currentIssueInfo = ref({
  id: null,
  number: null,
  status: '待开奖',
  time: '今天 21:30'
})

// 选中的数字
const selectedThousands = ref([])
const selectedHundreds = ref([])
const selectedTens = ref([])
const selectedUnits = ref([])

// 二字现特殊选择（存储数字组合）
const selectedCombinations = ref([])
// 二字现当前点击序列（用于按顺序生成组合）
const clickedSequence = ref([])

// 方案数据存储
const schemeData = ref({})
// 当前方案是否有更改
const hasChanges = ref(false)
// 显示保存提示弹窗
const showSaveDialog = ref(false)
// 待切换的方案ID
const pendingSchemeId = ref('')
// 已添加的方案列表
const addedSchemes = ref([])
// 主攻选择相关
const showMainAttackDialog = ref(false)
const mainAttackType = ref('') // 当前选择主攻的位数类型
const mainAttackNumbers = ref([]) // 主攻数字
const selectedMainAttack = ref([]) // 已选择的主攻数字
// 重点选择相关
const showKeyPointDialog = ref(false)
const keyPointNumbers = ref([]) // 重点数字
const selectedKeyPoint = ref([]) // 已选择的重点数字

// 方案列表
const schemeList = ref([
  { id: '头尾', name: '头尾' },
  { id: '中肚', name: '中肚' },
  { id: 'ABXX', name: 'ABXX' },
  { id: 'AXCX', name: 'AXCX' },
  { id: 'XBXD', name: 'XBXD' },
  { id: 'XXCD', name: 'XXCD' },
  { id: 'ABCX', name: 'ABCX' },
  { id: 'ABXD', name: 'ABXD' },
  { id: 'AXCD', name: 'AXCD' },
  { id: 'XBCD', name: 'XBCD' },
  { id: '芝麻', name: '芝麻' },
  { id: '二字现', name: '二字现' },
  { id: '三字现', name: '三字现' },
  { id: '定头', name: '定头' },
  { id: '定百', name: '定百' },
  { id: '定十', name: '定十' },
  { id: '定尾', name: '定尾' },
  { id: '杀头', name: '杀头' },
  { id: '杀百', name: '杀百' },
  { id: '杀十', name: '杀十' },
  { id: '杀尾', name: '杀尾' },
  { id: '稳码', name: '稳码' },
  { id: '头尾合', name: '头尾合' },
  { id: '中肚合', name: '中肚合' },
  { id: '千百合', name: '千百合' },
  { id: '千十合', name: '千十合' },
  { id: '百个合', name: '百个合' },
  { id: '十个合', name: '十个合' },
  { id: '死数', name: '死数' },
  { id: '头尾不合', name: '头尾不合' },
  { id: '中肚不合', name: '中肚不合' },
  { id: '千百不合', name: '千百不合' },
  { id: '千十不合', name: '千十不合' },
  { id: '百个不合', name: '百个不合' },
  { id: '十个不合', name: '十个不合' }
])

// 当前方案名称
const currentSchemeName = computed(() => {
  const scheme = schemeList.value.find(s => s.id === activeScheme.value)
  return scheme ? scheme.name : ''
})

// 已保存方案数量
const savedSchemeCount = computed(() => {
  return addedSchemes.value.length
})

// 发布按钮文本
const publishButtonText = computed(() => {
  return `${savedSchemeCount.value}/4`
})

// 根据方案类型获取需要显示的位数
const getSchemeDigits = (schemeId) => {
  switch (schemeId) {
    case '头尾':
      return ['thousands', 'units'] // 千位和个位
    case '中肚':
      return ['hundreds', 'tens'] // 百位和十位
    case 'ABXX':
      return ['thousands', 'hundreds'] // 千位和百位
    case 'ABCX':
      return ['thousands', 'hundreds', 'tens'] // 千位百位和十位
    case 'ABXD':
      return ['thousands', 'hundreds', 'units'] // 千位百位和个位
    case 'AXCD':
      return ['thousands', 'tens', 'units'] // 千位十位和个位
    case 'XBXD':
      return ['hundreds', 'units'] // 百位和个位
    case 'XBCD':
      return ['hundreds', 'tens', 'units'] // 百位十位和个位
    case 'XXCD':
      return ['tens', 'units'] // 十位和个位
    case 'AXCX':
      return ['thousands', 'tens'] // 千位和十位
    case '芝麻':
      return ['thousands', 'hundreds', 'tens', 'units'] // 所有位
    case '定头':
      return ['thousands'] // 只选择千位
    case '定百':
      return ['hundreds'] // 只选择百位
    case '定十':
      return ['tens'] // 只选择十位
    case '定尾':
      return ['units'] // 只选择个位
    case '杀头':
      return ['thousands'] // 只选择千位
    case '杀百':
      return ['hundreds'] // 只选择百位
    case '杀十':
      return ['tens'] // 只选择十位
    case '杀尾':
      return ['units'] // 只选择个位
    case '稳码':
      return ['units'] // 只选择个位
    case '头尾合':
      return ['thousands'] // 只显示千位选择区域
    case '中肚合':
      return ['hundreds'] // 只显示百位选择区域
    case '千百合':
      return ['thousands'] // 只显示千位选择区域
    case '千十合':
      return ['thousands'] // 只显示千位选择区域
    case '百个合':
      return ['hundreds'] // 只显示百位选择区域
    case '十个合':
      return ['tens'] // 只显示十位选择区域
    case '死数':
      return ['units'] // 只选择个位
    case '头尾不合':
      return ['units'] // 只选择个位
    case '中肚不合':
      return ['units'] // 只选择个位
    case '千百不合':
      return ['units'] // 只选择个位
    case '千十不合':
      return ['units'] // 只选择个位
    case '百个不合':
      return ['units'] // 只选择个位
    case '十个不合':
      return ['units'] // 只选择个位
    default:
      return ['thousands', 'tens'] // 默认千位和十位
  }
}

// 当前方案需要显示的位数
const currentSchemeDigits = computed(() => {
  return getSchemeDigits(activeScheme.value)
})

// 已发布的方案列表（用于禁用已发布的方案）
const publishedSchemes = ref([])

// 追帖模式相关
const isAppendMode = ref(false)
const appendPostData = ref(null)

// 请求锁 - 防止重复请求
const isLoadingIssueInfo = ref(false)
const isLoadingPublishedSchemes = ref(false)

// 检查是否从规律预测页面进入
const isFromPatternPredict = computed(() => {
  const pages = getCurrentPages()
  const previousPage = pages[pages.length - 2]
  return previousPage && previousPage.route === 'pages/pattern-predict/pattern-predict'
})

// 检查方案是否已发布
const isSchemePublished = (schemeId) => {
  return publishedSchemes.value.includes(schemeId)
}

// 检查是否进入追帖模式
const checkAppendMode = () => {
  try {
    const savedAppendData = uni.getStorageSync('appendPostData')
    
    // 检查数据是否有效，并且检查是否是当前彩票类型的帖子
    if (savedAppendData && savedAppendData.postId && savedAppendData.postContent) {
      // 优先检查保存的彩票类型
      let isCurrentLotteryPost = false
      
      if (savedAppendData.lotteryType) {
        // 如果保存了彩票类型，直接比较
        isCurrentLotteryPost = savedAppendData.lotteryType === currentLotteryType.value.name
      } else {
        // 兼容旧数据，检查帖子内容中是否包含当前彩票类型
        const currentLottery = currentLotteryType.value.name
        isCurrentLotteryPost = savedAppendData.postContent.includes(currentLottery) || 
                              savedAppendData.postContent.includes(`${currentLottery}-规律预测`)
      }
      
      if (isCurrentLotteryPost) {
        isAppendMode.value = true
        appendPostData.value = savedAppendData
      } else {
        // 如果不是当前彩票类型的帖子，清除追帖数据
        console.log('检测到追帖数据，但不是当前彩票类型，清除数据')
        uni.removeStorageSync('appendPostData')
        uni.removeStorageSync('currentAppendPostData')
        uni.removeStorageSync('appendModeTipShown')
        isAppendMode.value = false
        appendPostData.value = null
        return
      }
      
      // 显示追帖模式提示（只在第一次进入时显示）
      const hasShownTip = uni.getStorageSync('appendModeTipShown')
      if (!hasShownTip) {
        const schemeNames = savedAppendData.schemeIds ? savedAppendData.schemeIds.join('、') : '未知方案'
        uni.showModal({
          title: '追帖模式',
          content: `正在为帖子"第${savedAppendData.period}期"追加方案\n\n已发布的方案(${schemeNames})将被禁用，请选择其他方案进行追加。`,
          showCancel: false,
          confirmText: '知道了'
        })
        uni.setStorageSync('appendModeTipShown', true)
      }
      
      // 在追帖模式下，直接使用追帖数据设置已发布方案
      const today = new Date().toDateString()
      const publishedSchemesList = []
      const publishedPostsList = {}
      
      // 从追帖数据中提取所有方案信息
      const schemeIds = savedAppendData.schemeIds || []
      schemeIds.forEach(schemeId => {
        if (schemeId) {
          publishedSchemesList.push(schemeId)
          publishedPostsList[schemeId] = savedAppendData.postId
        }
      })
      
      // 直接更新响应式变量
      publishedSchemes.value = publishedSchemesList
      
      // 保存到本地存储（持久化保存）
      uni.setStorageSync(`publishedSchemes_${today}`, publishedSchemesList)
      uni.setStorageSync(`publishedPosts_${today}`, publishedPostsList)
      
      // 同时保存追帖数据到专门的存储键，确保数据不丢失
      uni.setStorageSync('currentAppendPostData', savedAppendData)
      
    } else {
      // 如果没有appendPostData，检查是否有保存的追帖数据
      const currentAppendData = uni.getStorageSync('currentAppendPostData')
      if (currentAppendData && currentAppendData.postId) {
        isAppendMode.value = true
        appendPostData.value = currentAppendData
        
        // 重新加载已发布方案
        loadPublishedSchemes()
      }
    }
  } catch (error) {
    console.error('检查追帖模式失败:', error)
  }
}

// 测试函数：获取用户已发布的帖子
const testPublishedScheme = async () => {
  // 防止重复请求
  if (isLoadingPublishedSchemes.value) {
    console.log('正在加载已发布方案，跳过重复请求')
    return
  }
  
  try {
    isLoadingPublishedSchemes.value = true
    uni.showLoading({ title: '获取已发布帖子...' })
    
    // 调用接口获取用户已发布的帖子
    const response = await apiPostListQuery({
      page: 1,
      size: 20,
      account: uni.getStorageSync('account') || ''
    })
    
    uni.hideLoading()
    
    if (response.code === 200 && response.data && response.data.records) {
      const today = new Date().toDateString()
      const publishedSchemes = []
      const publishedPosts = {}
      
      // 处理返回的帖子数据
      response.data.records.forEach(post => {
        if (post.content && post.content.includes('预测方案')) {
          // 从帖子内容中提取方案信息
          const content = post.content
          
          // 检查是否包含特定方案
          if (content.includes('中肚')) {
            publishedSchemes.push('中肚')
            publishedPosts['中肚'] = post.id
          }
          if (content.includes('头尾')) {
            publishedSchemes.push('头尾')
            publishedPosts['头尾'] = post.id
          }
          if (content.includes('定头')) {
            publishedSchemes.push('定头')
            publishedPosts['定头'] = post.id
          }
          if (content.includes('定百')) {
            publishedSchemes.push('定百')
            publishedPosts['定百'] = post.id
          }
          if (content.includes('定十')) {
            publishedSchemes.push('定十')
            publishedPosts['定十'] = post.id
          }
          if (content.includes('定尾')) {
            publishedSchemes.push('定尾')
            publishedPosts['定尾'] = post.id
          }
        }
      })
      
      // 保存到本地存储
      uni.setStorageSync(`publishedSchemes_${today}`, publishedSchemes)
      uni.setStorageSync(`publishedPosts_${today}`, publishedPosts)
      
      // 重新加载已发布方案
      loadPublishedSchemes()
      
      uni.showToast({
        title: `获取到${publishedSchemes.length}个已发布方案`,
        icon: 'success'
      })
      
    } else {
      // 接口返回失败，使用备用方案
      handleApiFailure()
    }
    
  } catch (error) {
    uni.hideLoading()
    console.error('获取已发布帖子失败:', error)
    
    // 接口调用失败，使用备用方案
    handleApiFailure()
  } finally {
    isLoadingPublishedSchemes.value = false
  }
}

// 处理接口失败的情况
const handleApiFailure = () => {
  try {
    // 如果是追帖模式，从追帖数据中提取已发布的方案
    if (isAppendMode.value && appendPostData.value) {
      const today = new Date().toDateString()
      const publishedSchemes = []
      const publishedPosts = {}
      
      // 从追帖数据中提取方案信息
      const schemeIds = appendPostData.value.schemeIds || []
      schemeIds.forEach(schemeId => {
        if (schemeId) {
          publishedSchemes.push(schemeId)
          publishedPosts[schemeId] = appendPostData.value.postId
        }
      })
      
      // 保存到本地存储
      uni.setStorageSync(`publishedSchemes_${today}`, publishedSchemes)
      uni.setStorageSync(`publishedPosts_${today}`, publishedPosts)
      
      // 重新加载已发布方案
      loadPublishedSchemes()
      
      uni.showToast({
        title: `追帖模式：已加载 ${publishedSchemes.length} 个方案`,
        icon: 'success'
      })
      
    } else {
      // 非追帖模式，显示提示信息
      uni.showModal({
        title: '获取已发布帖子失败',
        content: '无法获取已发布的帖子信息，可能的原因：\n1. 网络连接问题\n2. 服务器暂时不可用\n3. 账号权限问题\n\n是否继续使用本地数据？',
        confirmText: '继续',
        cancelText: '重试',
        success: (res) => {
          if (res.confirm) {
            // 使用本地存储的数据
            loadPublishedSchemes()
            uni.showToast({
              title: '使用本地数据',
              icon: 'success'
            })
          } else {
            // 重试获取
            setTimeout(() => {
              testPublishedScheme()
            }, 1000)
          }
        }
      })
    }
    
  } catch (error) {
    console.error('处理接口失败情况时出错:', error)
    uni.showToast({
      title: '操作失败，请重试',
      icon: 'none'
    })
  }
}

// 清除测试数据
const clearTestData = () => {
  const today = new Date().toDateString()
  uni.removeStorageSync(`publishedSchemes_${today}`)
  uni.removeStorageSync(`publishedPosts_${today}`)
  
  publishedSchemes.value = []
  
  uni.showToast({
    title: '已清除测试数据',
    icon: 'success'
  })
}

// 获取已发布的方案列表
const loadPublishedSchemes = async () => {
  try {
    const today = new Date().toDateString()
    const publishedData = uni.getStorageSync(`publishedSchemes_${today}`) || []
    publishedSchemes.value = publishedData
    
    // 如果有已发布的方案，显示提示
    if (publishedSchemes.value.length > 0) {
      // 检测到已发布的方案
    }
  } catch (error) {
    console.error('加载已发布方案失败:', error)
  }
}

// 选择方案
const selectScheme = (schemeId) => {
  // 如果是同一个方案，直接返回
  if (schemeId === activeScheme.value) {
    return
  }
  
  // 检查方案是否已发布 - 已发布的方案无法选择（规律帖除外）
  if (!isFromPatternPredict.value && isSchemePublished(schemeId)) {
    uni.showToast({
      title: '该方案今天已发布过，无法重复选择',
      icon: 'none',
      duration: 2000
    })
    return
  }
  
  // 如果当前方案有更改，显示保存提示
  if (hasChanges.value) {
    pendingSchemeId.value = schemeId
    showSaveDialog.value = true
    return
  }
  
  // 没有更改，直接切换
  switchToScheme(schemeId)
}

// 进入追帖模式
const enterAppendMode = (schemeId) => {
  try {
    // 获取该方案对应的帖子ID
    const today = new Date().toDateString()
    const publishedPosts = uni.getStorageSync(`publishedPosts_${today}`) || {}
    const postId = publishedPosts[schemeId]
    
    if (!postId) {
      uni.showToast({
        title: '未找到对应的帖子ID',
        icon: 'none'
      })
      return
    }
    
    // 跳转到预测发布页面，传递帖子ID
    uni.navigateTo({
      url: `/pages/predict-publish/predict-publish?postId=${postId}&schemeId=${schemeId}`,
      success: () => {
        uni.showToast({
          title: '进入追帖模式',
          icon: 'success'
        })
      },
      fail: (err) => {
        uni.showToast({
          title: '跳转失败',
          icon: 'none'
        })
      }
    })
  } catch (error) {
    console.error('进入追帖模式失败:', error)
    uni.showToast({
      title: '进入追帖模式失败',
      icon: 'none'
    })
  }
}

// 切换到指定方案
const switchToScheme = (schemeId) => {
  // 保存当前方案数据
  saveCurrentScheme()
  
  // 切换到新方案
  activeScheme.value = schemeId
  
  // 加载新方案数据
  loadSchemeData(schemeId)
  
  // 重置更改状态
  hasChanges.value = false
  
}

// 保存当前方案数据
const saveCurrentScheme = () => {
  if (activeScheme.value) {
    if (activeScheme.value === '二字现' || activeScheme.value === '三字现') {
      schemeData.value[activeScheme.value] = {
        combinations: [...selectedCombinations.value],
        sequence: [...clickedSequence.value]
      }
    } else {
      const currentData = {
        thousands: [...selectedThousands.value],
        hundreds: [...selectedHundreds.value],
        tens: [...selectedTens.value],
        units: [...selectedUnits.value]
      }
      
      // 保存主攻和重点数据
      if (schemeData.value[activeScheme.value]) {
        // 保留已存在的主攻和重点数据
        const existingData = schemeData.value[activeScheme.value]
        
        // 千位主攻和重点
        if (existingData.thousandsMainAttack) {
          currentData.thousandsMainAttack = [...existingData.thousandsMainAttack]
        }
        if (existingData.thousandsKeyPoint) {
          currentData.thousandsKeyPoint = [...existingData.thousandsKeyPoint]
        }
        
        // 百位主攻和重点
        if (existingData.hundredsMainAttack) {
          currentData.hundredsMainAttack = [...existingData.hundredsMainAttack]
        }
        if (existingData.hundredsKeyPoint) {
          currentData.hundredsKeyPoint = [...existingData.hundredsKeyPoint]
        }
        
        // 十位主攻和重点
        if (existingData.tensMainAttack) {
          currentData.tensMainAttack = [...existingData.tensMainAttack]
        }
        if (existingData.tensKeyPoint) {
          currentData.tensKeyPoint = [...existingData.tensKeyPoint]
        }
        
        // 个位主攻和重点
        if (existingData.unitsMainAttack) {
          currentData.unitsMainAttack = [...existingData.unitsMainAttack]
        }
        if (existingData.unitsKeyPoint) {
          currentData.unitsKeyPoint = [...existingData.unitsKeyPoint]
        }
      }
      
      schemeData.value[activeScheme.value] = currentData
    }
  }
  
  // 保存到本地存储
  saveSchemesToStorage()
}

// 加载方案数据
const loadSchemeData = (schemeId) => {
  const data = schemeData.value[schemeId]
  if (data) {
    if (schemeId === '二字现' || schemeId === '三字现') {
      selectedCombinations.value = [...(data.combinations || [])]
      clickedSequence.value = [...(data.sequence || [])]
    } else {
      selectedThousands.value = [...(data.thousands || [])]
      selectedHundreds.value = [...(data.hundreds || [])]
      selectedTens.value = [...(data.tens || [])]
      selectedUnits.value = [...(data.units || [])]
    }
  } else {
    selectedThousands.value = []
    selectedHundreds.value = []
    selectedTens.value = []
    selectedUnits.value = []
    selectedCombinations.value = []
  }
}

// 切换数字选择
const toggleNumber = (type, num) => {
  const value = num - 1  // num是1-10，value是0-9
  
  // 二字现特殊处理
  if (activeScheme.value === '二字现') {
    toggleCombinationNumber(value)
    return
  }
  
  // 三字现特殊处理
  if (activeScheme.value === '三字现') {
    toggleThreeDigitCombination(value)
    return
  }
  
  // 根据方案类型设置最大选择数量
  let maxSelection = 6
  if (activeScheme.value === '杀头' || activeScheme.value === '杀百' || activeScheme.value === '杀十' || activeScheme.value === '杀尾' || activeScheme.value === '稳码' || activeScheme.value === '头尾不合' || activeScheme.value === '中肚不合' || activeScheme.value === '千百不合' || activeScheme.value === '千十不合' || activeScheme.value === '百个不合' || activeScheme.value === '十个不合') {
    maxSelection = 2
  } else if (activeScheme.value === '死数') {
    maxSelection = 1
  }
  
  let targetArray = null
  
  switch (type) {
    case 'thousands':
      targetArray = selectedThousands.value
      break
    case 'hundreds':
      targetArray = selectedHundreds.value
      break
    case 'tens':
      targetArray = selectedTens.value
      break
    case 'units':
      targetArray = selectedUnits.value
      break
    default:
      return
  }
  
  const index = targetArray.indexOf(value)
  if (index > -1) {
    targetArray.splice(index, 1)
  } else if (targetArray.length < maxSelection) {
    targetArray.push(value)
  } else {
    let message = '最多只能选择6个数字'
    if (activeScheme.value === '杀头' || activeScheme.value === '杀百' || activeScheme.value === '杀十' || activeScheme.value === '杀尾' || activeScheme.value === '稳码' || activeScheme.value === '头尾不合' || activeScheme.value === '中肚不合' || activeScheme.value === '千百不合' || activeScheme.value === '千十不合' || activeScheme.value === '百个不合' || activeScheme.value === '十个不合') {
      message = `${activeScheme.value}方案最多只能选择2个数字`
    } else if (activeScheme.value === '死数') {
      message = '死数方案只能选择1个数字'
    }
    uni.showToast({
      title: message,
      icon: 'none'
    })
  }
  
  // 标记为有更改
  hasChanges.value = true
}

// 二字现数字组合选择
const toggleCombinationNumber = (value) => {
  
  // 添加数字到点击序列
  clickedSequence.value.push(value)
  
  // 如果序列长度达到2，生成组合
  if (clickedSequence.value.length === 2) {
    // 创建标准化组合（确保较小的数字在前）
    const sortedNumbers = [...clickedSequence.value].sort((a, b) => a - b)
    const combination = `${sortedNumbers[0]}${sortedNumbers[1]}`
    
    // 检查是否已存在该组合
    if (!selectedCombinations.value.includes(combination)) {
      // 检查是否超过4组限制
      if (selectedCombinations.value.length < 4) {
        selectedCombinations.value.push(combination)
      } else {
        uni.showToast({
          title: '最多只能选择4组组合',
          icon: 'none'
        })
      }
    } else {
      uni.showToast({
        title: '该组合已存在',
        icon: 'none'
      })
    }
    
    // 重置点击序列，准备下一次组合
    clickedSequence.value = []
  }
  
  // 标记为有更改
  hasChanges.value = true
}

// 三字现数字组合选择
const toggleThreeDigitCombination = (value) => {
  
  // 添加数字到点击序列
  clickedSequence.value.push(value)
  
  // 如果序列长度达到3，生成组合
  if (clickedSequence.value.length === 3) {
    // 创建标准化组合（确保数字按顺序排列）
    const sortedNumbers = [...clickedSequence.value].sort((a, b) => a - b)
    const combination = sortedNumbers.join('')
    
    // 检查是否已存在该组合
    if (!selectedCombinations.value.includes(combination)) {
      // 检查是否超过15组限制
      if (selectedCombinations.value.length < 15) {
        selectedCombinations.value.push(combination)
      } else {
        uni.showToast({
          title: '最多只能选择15组组合',
          icon: 'none'
        })
      }
    } else {
      uni.showToast({
        title: '该组合已存在',
        icon: 'none'
      })
    }
    
    // 重置点击序列，准备下一次组合
    clickedSequence.value = []
  }
  
  // 标记为有更改
  hasChanges.value = true
}

// 格式化组合显示，添加换行
const formatCombinations = (combinations) => {
  if (!combinations || combinations.length === 0) {
    return ''
  }
  
  // 每行最多显示6个组合，超过则换行
  const maxPerLine = 6
  const lines = []
  
  for (let i = 0; i < combinations.length; i += maxPerLine) {
    const lineCombinations = combinations.slice(i, i + maxPerLine)
    lines.push(lineCombinations.join(','))
  }
  
  return lines.join('\n')
}

// 检查当前点击序列状态（用于二字现显示提示）
const getSequenceStatus = () => {
  if (activeScheme.value === '二字现') {
    if (clickedSequence.value.length === 0) {
      return '点击两个数字组成组合'
    } else if (clickedSequence.value.length === 1) {
      return `已选择 ${clickedSequence.value[0]}，再选择一个数字`
    }
  } else if (activeScheme.value === '三字现') {
    if (clickedSequence.value.length === 0) {
      return '点击三个数字组成组合'
    } else if (clickedSequence.value.length === 1) {
      return `已选择 ${clickedSequence.value[0]}，再选择两个数字`
    } else if (clickedSequence.value.length === 2) {
      return `已选择 ${clickedSequence.value.join(',')}，再选择一个数字`
    }
  }
  return ''
}

// 验证方案完整性
const validateSchemeCompleteness = () => {
  // 二字现和三字现不需要验证位数完整性
  if (activeScheme.value === '二字现' || activeScheme.value === '三字现') {
    return true
  }
  
  // 获取当前方案需要的位数
  const requiredDigits = getSchemeDigits(activeScheme.value)
  
  // 检查每个必需的位数是否都至少选择了一个数字
  for (const digit of requiredDigits) {
    let selectedCount = 0
    
    switch (digit) {
      case 'thousands':
        selectedCount = selectedThousands.value.length
        break
      case 'hundreds':
        selectedCount = selectedHundreds.value.length
        break
      case 'tens':
        selectedCount = selectedTens.value.length
        break
      case 'units':
        selectedCount = selectedUnits.value.length
        break
    }
    
    // 如果某个必需位数没有选择数字，则数据不完整
    if (selectedCount === 0) {
      return false
    }
  }
  
  return true
}

// 清除当前方案
const clearScheme = () => {
  // 只清除当前方案的选择内容
  selectedThousands.value = []
  selectedHundreds.value = []
  selectedTens.value = []
  selectedUnits.value = []
  selectedCombinations.value = []
  clickedSequence.value = []
  
  // 清除当前方案的数据（包括主攻和重点）
  if (activeScheme.value) {
    schemeData.value[activeScheme.value] = {}
    
    // 从已添加的方案列表中删除当前方案
    const index = addedSchemes.value.findIndex(scheme => scheme.id === activeScheme.value)
    if (index > -1) {
      addedSchemes.value.splice(index, 1)
    }
  }
  
  // 保存到本地存储
  saveSchemesToStorage()
  
  // 重置更改状态
  hasChanges.value = false
  
  uni.showToast({
    title: `${currentSchemeName.value}方案已清除`,
    icon: 'success'
  })
}

// 添加方案
const addScheme = () => {
  // 检查当前方案是否有内容
  let hasContent = false
  
  if (activeScheme.value === '二字现' || activeScheme.value === '三字现') {
    hasContent = selectedCombinations.value.length > 0
  } else {
    hasContent = selectedThousands.value.length > 0 || 
                 selectedHundreds.value.length > 0 || 
                 selectedTens.value.length > 0 || 
                 selectedUnits.value.length > 0
  }
  
  if (!hasContent) {
    uni.showToast({
      title: '请先配置方案内容',
      icon: 'none'
    })
    return
  }
  
  // 检查必需位数的完整性
  if (!validateSchemeCompleteness()) {
    uni.showToast({
      title: '添加失败,数据不完整',
      icon: 'none'
    })
    return
  }
  
  // 检查是否已达到最大数量
  if (addedSchemes.value.length >= 4) {
    uni.showToast({
      title: '最多只能添加4个方案',
      icon: 'none'
    })
    return
  }
  
  // 保存当前方案数据
  saveCurrentScheme()
  
  // 添加到已添加方案列表
  const schemeToAdd = {
    id: activeScheme.value,
    name: currentSchemeName.value,
    data: { ...schemeData.value[activeScheme.value] },
    timestamp: Date.now()
  }
  
  addedSchemes.value.push(schemeToAdd)
  
  // 保存到本地存储
  saveSchemesToStorage()
  
  // 清除当前方案内容
  clearCurrentScheme()
  
  uni.showToast({
    title: '方案已添加',
    icon: 'success'
  })
  
}

// 清除当前方案内容（但不影响已添加的方案）
const clearCurrentScheme = () => {
  selectedThousands.value = []
  selectedHundreds.value = []
  selectedTens.value = []
  selectedUnits.value = []
  selectedCombinations.value = []
  clickedSequence.value = []
  hasChanges.value = false
}

// 保存方案
const saveScheme = () => {
  saveCurrentScheme()
  hasChanges.value = false
  showSaveDialog.value = false
  
  // 切换到待切换的方案
  if (pendingSchemeId.value) {
    switchToScheme(pendingSchemeId.value)
    pendingSchemeId.value = ''
  }
}

// 不保存方案
const dontSaveScheme = () => {
  showSaveDialog.value = false
  
  // 重置当前方案的选择状态（清空选择）
  selectedThousands.value = []
  selectedHundreds.value = []
  selectedTens.value = []
  selectedUnits.value = []
  selectedCombinations.value = []
  clickedSequence.value = []
  addedSchemes.value = [] // 清除所有已添加的方案
  hasChanges.value = false
  
  // 切换到待切换的方案
  if (pendingSchemeId.value) {
    switchToScheme(pendingSchemeId.value)
    pendingSchemeId.value = ''
  }
}

// 显示主攻选择弹窗
const showMainAttack = (type) => {
  mainAttackType.value = type
  // 根据类型获取已选择的数字
  switch (type) {
    case 'thousands':
      mainAttackNumbers.value = [...selectedThousands.value]
      break
    case 'hundreds':
      mainAttackNumbers.value = [...selectedHundreds.value]
      break
    case 'tens':
      mainAttackNumbers.value = [...selectedTens.value]
      break
    case 'units':
      mainAttackNumbers.value = [...selectedUnits.value]
      break
  }
  // 初始化主攻选择为空
  selectedMainAttack.value = []
  showMainAttackDialog.value = true
}

// 隐藏主攻选择弹窗
const hideMainAttack = () => {
  showMainAttackDialog.value = false
  mainAttackType.value = ''
  mainAttackNumbers.value = []
  selectedMainAttack.value = []
}

// 选择主攻数字
const toggleMainAttackNumber = (num) => {
  const index = selectedMainAttack.value.indexOf(num)
  
  if (index > -1) {
    // 取消选择
    selectedMainAttack.value.splice(index, 1)
  } else {
    // 主攻不能全选，必须至少留一个数字不选主攻
    if (selectedMainAttack.value.length < mainAttackNumbers.value.length - 1) {
      selectedMainAttack.value.push(num)
    } else {
      uni.showToast({
        title: '主攻不能全选，必须至少留一个数字',
        icon: 'none'
      })
    }
  }
}

// 检查主攻数字是否被选中
const isMainAttackSelected = (num) => {
  return selectedMainAttack.value.includes(num)
}

// 确认主攻选择
const confirmMainAttack = () => {
  if (selectedMainAttack.value.length === 0) {
    uni.showToast({
      title: '请至少选择一个主攻数字',
      icon: 'none'
    })
    return
  }
  
  // 保存主攻选择到方案数据中，按位数分别保存
  if (!schemeData.value[activeScheme.value]) {
    schemeData.value[activeScheme.value] = {}
  }
  
  // 为当前位数保存主攻数据
  const mainAttackKey = `${mainAttackType.value}MainAttack`
  schemeData.value[activeScheme.value][mainAttackKey] = [...selectedMainAttack.value]
  
  hideMainAttack()
  uni.showToast({
    title: `${getMainAttackTitle()}主攻已设置: ${selectedMainAttack.value.join(',')}`,
    icon: 'success'
  })
}

// 检查是否显示主攻按钮
const shouldShowMainAttack = (type) => {
  if (activeScheme.value !== '定头' && activeScheme.value !== '定百' && activeScheme.value !== '定十' && activeScheme.value !== '定尾' && activeScheme.value !== '头尾合' && activeScheme.value !== '中肚合' && activeScheme.value !== '千百合' && activeScheme.value !== '千十合' && activeScheme.value !== '百个合' && activeScheme.value !== '十个合' && activeScheme.value !== '头尾' && activeScheme.value !== '中肚' && activeScheme.value !== 'ABXX' && activeScheme.value !== 'AXCX' && activeScheme.value !== 'XBXD' && activeScheme.value !== 'XXCD' && activeScheme.value !== 'ABCX' && activeScheme.value !== 'ABXD' && activeScheme.value !== 'AXCD' && activeScheme.value !== 'XBCD' && activeScheme.value !== '芝麻') return false
  
  let selectedCount = 0
  switch (type) {
    case 'thousands':
      selectedCount = selectedThousands.value.length
      break
    case 'hundreds':
      selectedCount = selectedHundreds.value.length
      break
    case 'tens':
      selectedCount = selectedTens.value.length
      break
    case 'units':
      selectedCount = selectedUnits.value.length
      break
  }
  
  // 主攻不能全选，必须至少留一个数字不选主攻
  return selectedCount > 1
}

// 获取主攻标题
const getMainAttackTitle = () => {
  switch (mainAttackType.value) {
    case 'thousands':
      return '千位'
    case 'hundreds':
      return '百位'
    case 'tens':
      return '十位'
    case 'units':
      return '个位'
    default:
      return ''
  }
}

// 显示重点选择弹窗
const showKeyPoint = (type) => {
  mainAttackType.value = type
  // 获取对应位数已选择的主攻数字作为重点选择的候选
  const mainAttackKey = `${type}MainAttack`
  const mainAttackData = schemeData.value[activeScheme.value]?.[mainAttackKey] || []
  keyPointNumbers.value = [...mainAttackData]
  selectedKeyPoint.value = []
  showKeyPointDialog.value = true
}

// 隐藏重点选择弹窗
const hideKeyPoint = () => {
  showKeyPointDialog.value = false
  mainAttackType.value = ''
  keyPointNumbers.value = []
  selectedKeyPoint.value = []
}

// 选择重点数字
const toggleKeyPointNumber = (num) => {
  const index = selectedKeyPoint.value.indexOf(num)
  
  
  if (index > -1) {
    // 取消选择
    selectedKeyPoint.value.splice(index, 1)
  } else {
    // 重点不能全选，必须至少留一个数字不选重点
    if (selectedKeyPoint.value.length < keyPointNumbers.value.length - 1) {
      selectedKeyPoint.value.push(num)
    } else {
      uni.showToast({
        title: '重点不能全选，必须至少留一个数字',
        icon: 'none'
      })
    }
  }
}

// 检查重点数字是否被选中
const isKeyPointSelected = (num) => {
  return selectedKeyPoint.value.includes(num)
}

// 确认重点选择
const confirmKeyPoint = () => {
  if (selectedKeyPoint.value.length === 0) {
    uni.showToast({
      title: '请至少选择一个重点数字',
      icon: 'none'
    })
    return
  }
  
  // 保存重点选择到方案数据中，按位数分别保存
  if (!schemeData.value[activeScheme.value]) {
    schemeData.value[activeScheme.value] = {}
  }
  
  // 为当前位数保存重点数据
  const keyPointKey = `${mainAttackType.value}KeyPoint`
  schemeData.value[activeScheme.value][keyPointKey] = [...selectedKeyPoint.value]
  
  hideKeyPoint()
  uni.showToast({
    title: `${getMainAttackTitle()}重点已设置: ${selectedKeyPoint.value.join(',')}`,
    icon: 'success'
  })
}

// 检查是否显示重点按钮
const shouldShowKeyPoint = (type) => {
  if (activeScheme.value !== '定头' && activeScheme.value !== '定百' && activeScheme.value !== '定十' && activeScheme.value !== '定尾' && activeScheme.value !== '头尾合' && activeScheme.value !== '中肚合' && activeScheme.value !== '千百合' && activeScheme.value !== '千十合' && activeScheme.value !== '百个合' && activeScheme.value !== '十个合' && activeScheme.value !== '头尾' && activeScheme.value !== '中肚' && activeScheme.value !== 'ABXX' && activeScheme.value !== 'AXCX' && activeScheme.value !== 'XBXD' && activeScheme.value !== 'XXCD' && activeScheme.value !== 'ABCX' && activeScheme.value !== 'ABXD' && activeScheme.value !== 'AXCD' && activeScheme.value !== 'XBCD' && activeScheme.value !== '芝麻') return false
  
  // 检查对应位数是否有主攻选择，且主攻数量大于等于2个
  const mainAttackKey = `${type}MainAttack`
  const mainAttackData = schemeData.value[activeScheme.value]?.[mainAttackKey]
  return mainAttackData && mainAttackData.length >= 2
}

// 去发布
const goToPublish = () => {
  if (addedSchemes.value.length === 0) {
    uni.showToast({
      title: '请先添加方案',
      icon: 'none'
    })
    return
  }
  
  // 检查是否从规律预测页面进入 - 规律帖不应该进入追帖模式
  const pages = getCurrentPages()
  const hasPatternPredictPage = pages.some(page => 
    page.route === 'pages/pattern-predict/pattern-predict'
  )
  
  // 如果是规律帖，直接返回到规律预测页面
  if (hasPatternPredictPage) {
    // 保存方案数据到本地存储，供规律预测页面使用
    uni.setStorageSync('predict_schemes_data', {
      addedSchemes: addedSchemes.value,
      schemeData: schemeData.value,
      timestamp: Date.now()
    })
    
    uni.navigateBack()
    return
  }
  
  // 如果是追帖模式，直接进入追帖流程
  if (isAppendMode.value && appendPostData.value) {
    proceedToAppendPost()
    return
  }
  
  // 检查是否有已发布的方案需要追帖
  const publishedSchemesInCurrent = addedSchemes.value.filter(scheme => 
    isSchemePublished(scheme.id)
  )
  
  // 如果所有选择的方案都没有发布过，直接发新帖
  if (publishedSchemesInCurrent.length === 0) {
    proceedToPublish()
    return
  }
  
  // 如果有已发布的方案，提示用户选择处理方式
  const publishedNames = publishedSchemesInCurrent.map(s => s.name).join('、')
  uni.showModal({
    title: '检测到已发布方案',
    content: `以下方案今天已发布过：${publishedNames}\n\n选择处理方式：`,
    confirmText: '进入追帖模式',
    cancelText: '继续发新帖',
    success: (res) => {
      if (res.confirm) {
        // 进入追帖模式 - 跳转到第一个已发布方案的追帖
        const firstPublishedScheme = publishedSchemesInCurrent[0]
        enterAppendMode(firstPublishedScheme.id)
      } else {
        // 继续发新帖
        proceedToPublish()
      }
    }
  })
}

// 处理追帖发布
const proceedToAppendPost = () => {
  try {
    if (!appendPostData.value || !appendPostData.value.postId) {
      uni.showToast({
        title: '追帖数据异常',
        icon: 'none'
      })
      return
    }
    
    // 准备传递的数据
    const publishData = {
      schemes: addedSchemes.value,
      lotteryType: currentLotteryType.value,
      issueInfo: currentIssueInfo.value,
      appendMode: true,
      appendPostData: appendPostData.value
    }
    
    // 跳转到预测发布页面，进入追帖模式
    uni.navigateTo({
      url: `/pages/predict-publish/predict-publish?data=${encodeURIComponent(JSON.stringify(publishData))}&postId=${appendPostData.value.postId}`,
      success: () => {
        // 不立即清除追帖数据，让predict-publish.vue在追帖完成后清除
      },
      fail: (err) => {
        uni.showToast({
          title: '跳转失败',
          icon: 'none'
        })
      }
    })
    
  } catch (error) {
    uni.showToast({
      title: '操作失败，请重试',
      icon: 'none'
    })
  }
}

// 继续发新帖
const proceedToPublish = () => {
  // 检查是否从规律预测页面进入 - 使用更可靠的检测方法
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const previousPage = pages[pages.length - 2]
  
  // 检查页面栈中是否有规律预测页面
  const hasPatternPredictPage = pages.some(page => 
    page.route === 'pages/pattern-predict/pattern-predict'
  )
  
  console.log('=== 检查页面来源 ===')
  console.log('页面栈长度:', pages.length)
  console.log('当前页面:', currentPage.route)
  console.log('上一页面:', previousPage ? previousPage.route : '无')
  console.log('页面栈中是否有规律预测页面:', hasPatternPredictPage)
  
  // 如果页面栈中有规律预测页面，返回到规律预测页面
  if (hasPatternPredictPage) {
    console.log('检测到规律帖模式，返回到规律预测页面')
    // 保存方案数据到本地存储，供规律预测页面使用
    uni.setStorageSync('predict_schemes_data', {
      addedSchemes: addedSchemes.value,
      schemeData: schemeData.value,
      timestamp: Date.now()
    })
    
    uni.navigateBack()
    return
  }
  
  // 准备传递的数据
  const publishData = {
    schemes: addedSchemes.value,
    lotteryType: currentLotteryType.value,
    issueInfo: currentIssueInfo.value
  }
  
  uni.navigateTo({
    url: `/pages/predict-publish/predict-publish?data=${encodeURIComponent(JSON.stringify(publishData))}`
  })
}

// 返回
const goBack = () => {
  uni.navigateBack()
}

// 处理修改方案
const handleModifySchemes = (schemesToModify) => {
  if (schemesToModify && schemesToModify.length > 0) {
    // 将修改的方案数据恢复到已添加方案列表
    addedSchemes.value = [...schemesToModify]
    
    // 显示提示信息
    uni.showToast({
      title: '已加载修改的方案',
      icon: 'success'
    })
  }
}

// 从论坛页面获取当前选中的彩票类型
const loadCurrentLotteryType = () => {
  try {
    // 从本地存储获取论坛页面选中的彩票类型
    const forumLotteryType = uni.getStorageSync('currentLotteryType')
    if (forumLotteryType) {
      currentLotteryType.value = forumLotteryType
    }
    
    const savedIssueInfo = uni.getStorageSync('currentIssueInfo')
    if (savedIssueInfo) {
      currentIssueInfo.value = savedIssueInfo
    }
  } catch (error) {
    console.error('加载彩票类型失败:', error)
  }
}

// 加载期号信息
const loadIssueInfo = async () => {
  // 防止重复请求
  if (isLoadingIssueInfo.value) {
    console.log('正在加载期号信息，跳过重复请求')
    return
  }
  
  try {
    // 如果已经有期号信息，直接返回
    if (currentIssueInfo.value.number && currentIssueInfo.value.number !== '--') {
      return
    }
    
    isLoadingIssueInfo.value = true
    uni.showLoading({ title: '加载中...' })
    
    const response = await apiGetIssueNo({ cpid: currentLotteryType.value.id })
    
    uni.hideLoading()
    
    if (response.code === 200 && response.data !== null && response.data !== undefined) {
      let issueNumber = null
      let issueStatus = '待开奖'
      let issueTime = '今天 21:30'
      
      if (typeof response.data === 'number' || typeof response.data === 'string') {
        issueNumber = response.data.toString()
      } else if (typeof response.data === 'object') {
        issueNumber = response.data.issueno || response.data.number || response.data.id
        issueStatus = response.data.status || '待开奖'
        issueTime = response.data.time || '今天 21:30'
      }
      
      currentIssueInfo.value = {
        id: issueNumber,
        number: issueNumber,
        status: issueStatus,
        time: issueTime
      }
      
      currentLotteryType.value.status = currentIssueInfo.value.status
      currentLotteryType.value.time = currentIssueInfo.value.time
    }
  } catch (error) {
    uni.hideLoading()
    console.error('加载期号信息失败:', error)
  } finally {
    isLoadingIssueInfo.value = false
  }
}


// 页面加载时监听修改事件
onMounted(() => {
  uni.$on('modifySchemes', handleModifySchemes)
  // 加载已保存的方案数据
  loadSavedSchemes()
  // 从论坛页面获取当前选中的彩票类型
  loadCurrentLotteryType()
  // 加载期号信息
  loadIssueInfo()
  // 加载已发布的方案列表
  loadPublishedSchemes()
  // 延迟检查是否进入追帖模式，确保 currentLotteryType 已加载
  setTimeout(() => {
    checkAppendMode()
  }, 100)
})

// 页面卸载时移除监听器
onUnmounted(() => {
  uni.$off('modifySchemes', handleModifySchemes)
})

// 保存方案到本地存储
const saveSchemesToStorage = () => {
  try {
    const schemesData = {
      addedSchemes: addedSchemes.value,
      schemeData: schemeData.value,
      timestamp: Date.now()
    }
    uni.setStorageSync('predict_schemes_data', schemesData)
  } catch (error) {
    console.error('保存方案数据失败:', error)
  }
}

// 从本地存储加载方案
const loadSavedSchemes = () => {
  try {
    const savedData = uni.getStorageSync('predict_schemes_data')
    if (savedData && savedData.addedSchemes) {
      addedSchemes.value = [...savedData.addedSchemes]
      if (savedData.schemeData) {
        schemeData.value = { ...savedData.schemeData }
      }
    }
  } catch (error) {
    console.error('加载方案数据失败:', error)
  }
}

// 清除本地存储的方案数据
const clearStoredSchemes = () => {
  try {
    uni.removeStorageSync('predict_schemes_data')
  } catch (error) {
    console.error('清除本地存储失败:', error)
  }
}
</script>

<style scoped>
.scheme-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 导航栏 */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 88rpx;
  background-color: #28B389;
  z-index: 999;
}

/* 追帖模式提示 */
.append-mode-tip {
  position: fixed;
  top: 88rpx;
  left: 0;
  right: 0;
  background-color: #f0f8f0;
  border-bottom: 1rpx solid #28B389;
  z-index: 998;
}

.tip-content {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
}

.tip-text {
  margin-left: 12rpx;
  font-size: 26rpx;
  color: #28B389;
  font-weight: 500;
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 30rpx;
}

.nav-left, .nav-right {
  width: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-arrow {
  font-size: 40rpx;
  color: #999;
  font-weight: bold;
  line-height: 1;
}

.nav-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #fff;
}

/* 主要内容区域 */
.main-content {
  display: flex;
  padding-top: 88rpx;
  padding-bottom: 120rpx; /* 为浮动按钮留出空间 */
}

/* 追帖模式下调整顶部间距 */
.scheme-container:has(.append-mode-tip) .main-content {
  padding-top: 140rpx; /* 为追帖提示留出额外空间 */
}

/* 左侧导航菜单 */
.sidebar {
  width: 200rpx;
  background-color: #fff;
  height: calc(100vh - 88rpx);
}

.menu-scroll {
  height: 100%;
  padding: 20rpx 0 0 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* 左侧菜单滚动条样式 */
.menu-scroll::-webkit-scrollbar {
  width: 8rpx;
}

.menu-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.menu-scroll::-webkit-scrollbar-thumb {
  background-color: #ddd;
  border-radius: 4rpx;
}

.menu-scroll::-webkit-scrollbar-thumb:hover {
  background-color: #ccc;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  margin: 10rpx 20rpx;
  border-radius: 10rpx;
  transition: all 0.3s ease;
}

.menu-item.active {
  background-color: #fff2f0;
}

.menu-item.published {
  background-color: #f0f8f0;
  opacity: 0.8;
}

.menu-item.disabled {
  background-color: #f5f5f5;
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.menu-text {
  font-size: 28rpx;
  color: #666;
}

.menu-item.active .menu-text {
  color: #ff4757;
  font-weight: 500;
}

.menu-item.published .menu-text {
  color: #28B389;
  font-weight: 500;
}

.menu-item.disabled .menu-text {
  color: #999;
  font-weight: 400;
}

.menu-icons {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

/* 底部标签 */
.menu-footer {
  padding: 20rpx 30rpx;
  text-align: center;
  border-top: 1rpx solid #f0f0f0;
  margin-top: 20rpx;
}

.footer-text {
  font-size: 24rpx;
  color: #999;
}

.test-buttons {
  margin-top: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.test-btn {
  height: 60rpx;
  background-color: #f0f0f0;
  color: #666;
  border: none;
  border-radius: 30rpx;
  font-size: 22rpx;
}

/* 右侧配置区域 */
.config-area {
  flex: 1;
  padding: 20rpx;
  background-color: #fff;
  margin: 20rpx 20rpx 20rpx 0;
  border-radius: 20rpx;
  box-sizing: border-box;
}

/* 数字选择区域 */
.digit-section {
  margin-bottom: 40rpx;
}

/* 二字现特殊区域 */
.combination-section {
  margin-bottom: 40rpx;
}

/* 主攻按钮 */
.main-attack-btn {
  margin-top: 20rpx;
  padding: 15rpx 30rpx;
  background-color: #f0f0f0;
  border-radius: 10rpx;
  text-align: center;
  border: 1rpx solid #ddd;
}

.main-attack-text {
  font-size: 28rpx;
  color: #666;
}

/* 重点按钮 */
.key-point-btn {
  margin-top: 20rpx;
  padding: 15rpx 30rpx;
  background-color: #f0f0f0;
  border-radius: 10rpx;
  text-align: center;
  border: 1rpx solid #ddd;
}

.key-point-text {
  font-size: 28rpx;
  color: #666;
}

/* 序列提示 */
.sequence-tip {
  margin: 20rpx 0;
  padding: 15rpx 20rpx;
  background-color: #f0f8ff;
  border-radius: 10rpx;
  text-align: center;
}

.tip-text {
  font-size: 24rpx;
  color: #1890ff;
}

.digit-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.label-text {
  font-size: 28rpx;
  color: #666;
  background-color: #f0f0f0;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
}

.limit-text {
  font-size: 24rpx;
  color: #999;
}

.number-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20rpx;
}

.number-item {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.number-item.selected {
  background-color: #ff4757;
}

.number-text {
  font-size: 32rpx;
  color: #666;
  font-weight: 500;
}

.number-item.selected .number-text {
  color: #fff;
}

/* 二字现选择次数显示 */
.selection-count {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  background-color: #ff4757;
  color: #fff;
  font-size: 20rpx;
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

/* 方案预览 */
.scheme-preview {
  background-color: #f8f8f8;
  padding: 30rpx;
  border-radius: 15rpx;
  margin-bottom: 40rpx;
  word-wrap: break-word;
  word-break: break-all;
  white-space: pre-wrap;
}

.preview-text {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 10rpx;
}

.preview-text:last-child {
  margin-bottom: 0;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 20rpx;
  margin-bottom: 40rpx; /* 适当间距 */
}

.clear-btn, .update-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 500;
  border: none;
}

.clear-btn {
  background-color: #f0f0f0;
  color: #666;
}

.update-btn {
  background-color: #ff4757;
  color: #fff;
}

/* 浮动发布按钮 */
.floating-btn {
  position: fixed;
  right: 30rpx;
  bottom: 30rpx;
  width: 120rpx;
  height: 120rpx;
  background-color: #ff4757;
  border-radius: 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 20rpx rgba(255, 71, 87, 0.3);
  z-index: 999;
}

.btn-text {
  font-size: 24rpx;
  color: #fff;
  font-weight: 500;
}

.btn-step {
  font-size: 20rpx;
  color: #fff;
  margin-top: 5rpx;
}

/* 保存提示弹窗 */
.save-dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.save-dialog {
  width: 600rpx;
  background-color: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  text-align: center;
}

.dialog-title {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 30rpx;
}

.dialog-message {
  display: block;
  font-size: 28rpx;
  color: #666;
  line-height: 1.5;
  margin-bottom: 40rpx;
}

.dialog-buttons {
  display: flex;
  gap: 20rpx;
}

.dialog-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 500;
  border: none;
}

.cancel-btn {
  background-color: #f0f0f0;
  color: #666;
}

.save-btn {
  background-color: #ff4757;
  color: #fff;
}

/* 主攻选择弹窗 */
.main-attack-dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.main-attack-dialog {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  margin: 0 40rpx;
  max-width: 600rpx;
  width: 100%;
}

.main-attack-numbers {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin: 30rpx 0;
  justify-content: center;
}

.main-attack-number-item {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  border: 2rpx solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f8f8;
  transition: all 0.3s ease;
}

.main-attack-number-item.selected {
  background-color: #ff4757;
  border-color: #ff4757;
}

.main-attack-number-text {
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
}

.main-attack-number-item.selected .main-attack-number-text {
  color: #fff;
}
</style>
