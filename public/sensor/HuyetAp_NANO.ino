#include <LiquidCrystal_I2C.h>  //hien thi
#include <EEPROM.h>             //luu gia tri cho lan chay tiep theo
// cho che do huyet ap
#include <XGZP6897D.h>           //cam bien ap suat
#include <SimpleKalmanFilter.h>  //bo loc nhieu
#include <Wire.h>
#include <SoftwareSerial.h>


// //DEFINE PIN
//DEFINE CONST
#define K 64
//nrf address 1

// //------------------------------------------

LiquidCrystal_I2C lcd(0x27, 16, 2);
SimpleKalmanFilter bo_loc(0.01, 0.1, 0.001);

// he so chia cua cam bien ap suat
#define K 64
XGZP6897D pressSensor(K);

// #define HUYETAP
// #define DEBUG

#define nutnhan1 A0

#define coi 7
#define VALVE_PIN 3
#define PUMB_PIN 5
unsigned long lastSendData = 0;
int Data_gui[4];
// huyet ap tam thu va tam truong
int sbp, dbp, upper_pressure, lower_pressure;
int16_t temperature;
int32_t pressure;
float mmHg_kalman[100], mmHg_kalman_tam, mmHg_kalman_cu;
int index = 0;
bool reached_140_mmhg = false, downto_60_mmhg = false;

// các mốc thời gian:
// #dem_t: thời gian có giọt chảy xuống (ms),flag_huyetap_fail
// #time_press_btn: thời gian nhấn nút
// #time_without_pulse: thời gian giữa 2 lần nhịp đập
// #last_update_nguong: thời gian cập nhật ngưỡng
uint32_t dem_t, t, time_press_btn, time_without_pulse, last_update_nguong;

// các trạng thái của chương trình
bool start = false, flag_coi = false, canhbao = false, flag_huyetap_fail = false, flag_huyetap_fail_running = false, flag_pumb = true, is_pressure_done = false;
const unsigned long intervalToSendData = 4000;
// che do chuong trinh
int mode = 1;  // 0 la che do dem giot, 1 la che do huyet ap
// nguong cua cam bien. se thay doi tuy theo vi tri cua cam bien, nen can cap nhat lien tuc
int nguong_tong = 0;

void setup() {
  // khởi tạo các chân pin
  pinMode(nutnhan1, INPUT_PULLUP);
  pinMode(coi, OUTPUT);
  pinMode(VALVE_PIN, OUTPUT);
  pinMode(PUMB_PIN, OUTPUT);
  Serial3.begin(9600);
  digitalWrite(coi, LOW);
  delay(100);
  digitalWrite(coi, HIGH);
  digitalWrite(PUMB_PIN, LOW);
  digitalWrite(VALVE_PIN, HIGH);


  // khởi tạo Serial để debug
  //Serial.begin(9600);
  Serial.println("he thong  do huyet ap");

  // doc gia tri huyet ap tu eeprom
  sbp = EEPROM.read(1);
  sbp |= EEPROM.read(2);

  dbp = EEPROM.read(3);
  dbp |= EEPROM.read(4);

  if (!pressSensor.begin()) {
    Serial.println("Failed to find sensor!");
    flag_huyetap_fail = true;
  }



  Wire.begin();


  // khởi tạo lcd
  lcd.init();
  lcd.backlight();
  lcd.setCursor(5, 0);
  lcd.print("BACH");
  lcd.setCursor(5, 1);
  lcd.print("MEDIQ");
  delay(1000);
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("HUYET AP: STOP ");

}  // end setup

void loop() {
  if (digitalRead(nutnhan1) == LOW && !flag_huyetap_fail_running) {
    delay(20);
    time_press_btn = millis();  //đếm thời gian bấm nút
    while (digitalRead(nutnhan1) == LOW) {
    }
    if ((millis() - time_press_btn) < 3000) {  //nếu bấm từ 1 - 3 s
      start = !start;                          //đảo start về stop và ngược lại
      digitalWrite(coi, LOW);                  //bật còi trong 0.5s
      delay(100);
      digitalWrite(coi, HIGH);
    }

    if (mode == 1 && start && !flag_huyetap_fail) {  //nếu đo huyết áp và start
      Serial.println("HUYET AP: START ");
      lcd.clear();
      lcd.print("HUYET AP: START ");
      flag_huyetap_fail_running = true;  //reset các biến đo liên quan đến huyết áp
      is_pressure_done = false;
      reached_140_mmhg = false;
      downto_60_mmhg = false;
      flag_pumb = true;
      time_without_pulse = millis();
    } else if (mode == 1 && !start && !flag_huyetap_fail) {  //nếu đo huyết áp và stop
      flag_huyetap_fail_running = false;
      Serial.println("HUYET AP: STOP  ");
      lcd.clear();
      lcd.print("HUYET AP: STOP  ");
      // if (dbp > 150) {
      //   dbp = random(90, 105);
      // }
      // if (sbp > 150) {
      //   sbp = random(70, 90);
      // }
      lcd.setCursor(0, 1);
      lcd.print("SBP:");  //in ra các giá trị huyết áp tâm trương và tâm thu của lần đo trước đó
      lcd.print(round(sbp));
      lcd.print(" DBP:");
      lcd.print(round(dbp));
      time_without_pulse = millis();
    } else if (mode == 1 && flag_huyetap_fail) {  //nếu đo huyết áp và cảm biến lỗi
      Serial.println("HUYET AP: ERROR");
      lcd.clear();
      lcd.print("HUYET AP: ERROR");
      delay(3000);
      //mode = 0;  //trở về đếm giọt
      start = false;
    }
  }




  if (mode == 1 && start && !flag_huyetap_fail && flag_huyetap_fail_running && !is_pressure_done) {  //nếu đo huyết áp và start và chưa đo xong và có cảm biến  và đang đo huyết áp
    if (flag_pumb && !is_pressure_done)                                                              // bat dau bom khi vao
    {
      digitalWrite(VALVE_PIN, LOW);  //dong van
      digitalWrite(PUMB_PIN, HIGH);  //bat may bom
      flag_pumb = false;             //moi lan do huyet ap chi bat 1 lan
    }
    pressSensor.readRawSensor(temperature, pressure);  //đo áp suất
    temperature = temperature / 256;
    pressure = pressure / K;                     //chia áp suất theo hệ số có trước
    mmHg_kalman_tam =bo_loc.updateEstimate(pressure * 0.00750061683);  //đổi đơn vị từ Pa sang mmHg và đưa qua bộ lọc

#ifdef HUYETAP  //debug
    Serial.print("ap suat: ");
    Serial.println(mmHg_kalman_tam);
#endif  // HUYETAP
    lcd.setCursor(0, 1);
    lcd.print("ap suat: ");
    lcd.print(String(mmHg_kalman_tam, 1));  //in ra áp suất hiện tại
    if (mmHg_kalman_tam > 160.0) {          //dat nguong 160mmhg, kết thúc quá trình bơm, bắt đầu quá trình xả
      reached_140_mmhg = true;
      digitalWrite(PUMB_PIN, LOW);  //tat bom
      delay(2000);
#ifdef DEBUG
      Serial.println("reached 140mmHg");
#endif  // DEBUG
    }
    if (reached_140_mmhg) {           //bat dau chu trinh xa khi de do huyet ap
      digitalWrite(VALVE_PIN, HIGH);  //dong, cat van xa khi de giam toc do xa khi
      delay(2);
      digitalWrite(VALVE_PIN, LOW);
      delay(2);

      if (mmHg_kalman_tam > mmHg_kalman_cu && mmHg_kalman_tam < 140) {  //tim cac lan tim dap
#ifdef DEBUG
        Serial.println("thay 1 nhip tim");
#endif                                         // DEBUG
        mmHg_kalman_cu = mmHg_kalman_tam;      //luu gia tri lan do hien tai lai de so sanh voi cac lan sau
        mmHg_kalman[index] = mmHg_kalman_tam;  //luu vao mot mảng giá trị để tí dùng
        if (upper_pressure == 0.0) {           //nếu sbp đang = 0 thì lần có tim đập đầu tiên sẽ là sbp
          upper_pressure = mmHg_kalman_tam;
          Serial.print("got upper: ");
          Serial.println(upper_pressure);
        }

        time_without_pulse = millis();      // lưu lại lần gần nhất có tim đập
        index++;                            //chỉ số của mảng giá trị
        if (index == 100) {                 //mảng đã đủ giá trị
          selectionSort(mmHg_kalman, 100);  //thuật toán sắp xếp giá trị từ bé đến lớn
          sbp = mmHg_kalman[99];
          dbp = mmHg_kalman[0];
#ifdef DEBUG
          Serial.println("ket qua (index toi 30): ");
          Serial.println(mmHg_kalman[0]);
          Serial.println(mmHg_kalman[99]);
#endif                              // DEBUG
          is_pressure_done = true;  //biến kết thúc chu trình đo huyết áp
          index = 0;
        }
      } else {
        mmHg_kalman_cu = mmHg_kalman_tam;  //luu gia tri lan do hien tai lai de so sanh voi cac lan sau
      }
      if (millis() - time_without_pulse > 3000 && upper_pressure != 0.0 && (reached_140_mmhg || downto_60_mmhg)) {  //nếu 3s không có nhịp tim thì dbp sẽ là áp suất hiện tại (nếu sbp đã có giá trị và đang trong chu trình xả khí)
        lower_pressure = mmHg_kalman_tam;                                                                           //lưu giá trị áp suất
#ifdef DEBUG
        delay(1000);
        Serial.print("LOwer_pressure: ");
        Serial.println(lower_pressure);
        Serial.print("upper pressure: ");
        Serial.println(upper_pressure);
        delay(1000);
#endif  // DEBUG
        sbp = upper_pressure;
        dbp = lower_pressure;
        is_pressure_done = true;  //biến kết thúc chu trình đo huyết áp
      }
    }
    if (reached_140_mmhg && mmHg_kalman_tam < 60.0) {  // khi áp suất giảm xuống dưới 60mmhg và đang trong quá trình xả
      downto_60_mmhg = true;
      reached_140_mmhg = false;
#ifdef DEBUG
      Serial.println("down to 60mmHg");
#endif  // DEBUG
    }
    if (mmHg_kalman_tam < 60.0 && downto_60_mmhg) {
      selectionSort(mmHg_kalman, 100);  // thuật toán sắp xếp
      sbp = mmHg_kalman[99];
      dbp = mmHg_kalman[0];
      if (dbp == 0.0) {  //tránh trường hợp dbp = 0
        for (int i = 0; i < 99; i++) {
          dbp = mmHg_kalman[i];
          if (dbp != 0.0) {
            break;
          }
        }
      }
      // if (dbp == 0.0) {
      //   dbp = random(59, 65);
      // }
      downto_60_mmhg = false;  //kết thúc chu trình xả khí
      is_pressure_done = true;
      delay(100);
    }
    if (is_pressure_done) {               //kết thức quá trình đo huyết áp
      flag_huyetap_fail_running = false;  //reset các biến về giá trị ban đầu để sẵn sàng cho lần đo tiếp theo
      start = false;
      upper_pressure = 0.0;
      lower_pressure = 0.0;
      digitalWrite(VALVE_PIN, HIGH);
      digitalWrite(PUMB_PIN, LOW);
      flag_pumb = true;
      mmHg_kalman_tam = 0.0;
      mmHg_kalman_cu = 0.0;
      for (int i = 0; i < 100; i++) {
        mmHg_kalman[i] = 0;
      }
      EEPROM.write(2, sbp >> 8);
      EEPROM.write(3, sbp);
      EEPROM.write(4, dbp >> 8);
      EEPROM.write(5, dbp);
      lcd.clear();
      lcd.print("HUYET AP: STOP ");
      lcd.setCursor(0, 1);
      lcd.print("SBP: ");
      lcd.print(round(sbp+6));
      lcd.print(" DBP: ");
      lcd.print(round(dbp));
      delay(1000);
      //gửi dữ liệu đi dùng nrf
    }
  }
  if (millis() - lastSendData > 5000) {
    //sendData();
    update_dulieu();
    lastSendData = millis();
  }
}

void selectionSort(float arr[], int n) {
  int i, j, min_idx;
  float temp;

  // One by one move boundary of unsorted subarray
  for (i = 0; i < n - 1; i++) {
    // Find the minimum element in unsorted array
    min_idx = i;
    for (j = i + 1; j < n; j++) {
      if (arr[j] < arr[min_idx]) {
        min_idx = j;
      }
    }
    // Swap the found minimum element with the first element
    temp = arr[min_idx];
    arr[min_idx] = arr[i];
    arr[i] = temp;
  }
#ifdef DEBUG
  Serial.println("ket qua: (sau sort):");
  Serial.println(arr[0]);
  Serial.println(arr[99]);
#endif  // DEBUG
}


void update_dulieu() {
  String data[2] = { String(sbp+6), String(dbp) };


  String combinedData = "";

  // Kết hợp các dữ liệu vào chuỗi
  for (int i = 0; i < 2; i++) {
    combinedData += data[i];
    if (i < 1) {
      combinedData += ",";  //
    }
  }
  combinedData += "\n";

  // Gửi chuỗi dữ liệu qua UART
  Serial3.print(combinedData);
}
