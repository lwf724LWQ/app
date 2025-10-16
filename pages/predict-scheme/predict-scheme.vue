<template>
  <view class="scheme-container">
    <!-- 导航栏 -->
    <view class="navbar">
      <view class="nav-content">
        <view class="nav-left" @click="goBack">
          <text class="back-arrow">‹</text>
        </view>
        <text class="nav-title">设置方案</text>
        <view class="nav-right"></view>
      </view>
    </view>
    
    <!-- 主要内容区域 -->
    <view class="main-content">
      <!-- 左侧导航菜单 -->
      <view class="sidebar">
        <scroll-view scroll-y class="menu-scroll">
          <view 
            class="menu-item" 
            :class="{ active: activeScheme === scheme.id }"
            v-for="scheme in schemeList" 
            :key="scheme.id"
            @click="selectScheme(scheme.id)"
          >
            <text class="menu-text">{{ scheme.name }}</text>
            <uni-icons v-if="activeScheme === scheme.id" type="checkmarkempty" size="16" color="#ff4757"></uni-icons>
          </view>
          <!-- 底部标签 -->
          <view class="menu-footer">
            <text class="footer-text">方案列表</text>
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

// 当前选中的方案
const activeScheme = ref('AXCX')

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

// 选择方案
const selectScheme = (schemeId) => {
  // 如果是同一个方案，直接返回
  if (schemeId === activeScheme.value) {
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
  
  // 跳转到发布页面，传递已添加的方案数据
  uni.navigateTo({
    url: `/pages/predict-publish/predict-publish?schemes=${encodeURIComponent(JSON.stringify(addedSchemes.value))}`
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

// 页面加载时监听修改事件
onMounted(() => {
  uni.$on('modifySchemes', handleModifySchemes)
  // 加载已保存的方案数据
  loadSavedSchemes()
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
    console.log('方案数据已保存到本地存储')
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
      console.log('已从本地存储加载方案数据:', addedSchemes.value.length, '个方案')
    }
  } catch (error) {
    console.error('加载方案数据失败:', error)
  }
}

// 清除本地存储的方案数据
const clearStoredSchemes = () => {
  try {
    uni.removeStorageSync('predict_schemes_data')
    console.log('本地存储的方案数据已清除')
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

.menu-text {
  font-size: 28rpx;
  color: #666;
}

.menu-item.active .menu-text {
  color: #ff4757;
  font-weight: 500;
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
