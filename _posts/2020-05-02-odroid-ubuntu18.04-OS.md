---
layout: post
title: "odroid에 ubuntu 설치"
tags: odroid ubuntu
date: 2020-05-02 01:14:28 -0400
categories: odroid ubuntu
---
* TOC
{:toc}
오드로이드에 우분투 설치에 앞서 설치를 지원하는 우분투 버전 정보를 알기 위해 지원하는 커널을 확인을 하겠습니다.  
공식사이트에서 hc2의 스펙을 가져왔습니다.  

odroid hc2 원보드 pc의 스펙은 이렇습니다.  
### Key features
- Samsung Exynos5422 Cortex-A15 2Ghz and Cortex-A7 Octa core CPUs  
- 2Gbyte LPDDR3 RAM PoP stacked  
- SATA-3 port for 3.5inch or 2.5inch HDD/SSD  storage up to 27mm thickness  
- Gigabit Ethernet port  
- USB 2.0 Host  
- UHS-1 capable micro-SD card slot for boot media  
- Size : 197 x 115 x 42 mm approx.(Aluminium cooling frame size)  
- Linux server OS images based on modern Kernel 4.14 LTS  
cpu는 삼성 갤럭시 S5에 사용되는 cpu입니다.  

# os 부팅 디스크
HC2가 지원하는 OS는 android와 ubuntu입니다. HC2는 NAS용으로 많이 사용하기 때문에 NAS용 운영체제인(OpenMediaValt)를 사용하지만 웹서버, 삼바서버로 이용하기 위해 Ubuntu를 설치하겠습니다.  
### 설치 과정

1. 준비  
오드로이드 공식사이트(<https://wiki.odroid.com/odroid-xu4/os_images/linux/ubuntu_4.14/ubuntu_4.14>)에서 우분투 이미지 파일을 다운로드합니다.  
- os 이미지 다운로드  
ubuntu-18.04.3-4.14-minimal-odroid-xu4-20190910.img.xz 을 다운로드했습니다.  
- 이미지 writer  <https://www.balena.io/etcher/>  
micro sd카드에 os 이미지를 쓰기 위해 이미지 writer를 다운로드합니다.

2. 설치  
sd 카드, 랜선을 꼽은 후 전원을 연결하면 odriod가 부팅하고 os를 설치합니다.
설치는 자동으로 됩니다. odroid용 ubuntu는 ssh서버가 자동으로 실행되므로 ssh접속을 통해 사용할 수 있습니다.  

3. 접속 설정  
odroid ip는 공유기 설정에서 연결된 ip에서 ssh 서버의 내부ip가 나오지 않는다.  
advanced port scanner 설치하여 내부 ip확인 후 내부망과 외부망으로 연결 시 내부포트 외부포트를 22번으로 포트포워딩 설정을 해준다.  
![](../../../static/img/20200502-odroid-ubuntu/port-fowording.JPG)  

### 원격 접속
putty로 ssh 접속을 한다.  
초기 id: root  
초기 pw: odroid  
![](../../../static/img/20200502-odroid-ubuntu/odroid-putty.JPG)  
접속 후 root 계정의 비밀번호를 ``sudo passwd root`` 명령어로 바로 변경해주겠습니다.

여기까지 진행하면 odroid에 ubuntu설치와 접속은 완료됩니다.

### 하드디스크 마운트
4테라 하드디스크를 마운트 하겠습니다. 우분투는 현재 디스크label type에서 4TB 이상은 한번에 마운트 할 수가 없습니다. 따라서 디스크label type 을 gpt로 변경하겠습니다.

1. 연결 디스크 확인  
``sudo fdisk -l``  
Disk /dev/sda: 3.7 TiB, 4000787030016 bytes, 7814037168 sectors  
Units: sectors of 1 * 512 = 512 bytes  
Sector size (logical/physical): 512 bytes / 4096 bytes  
I/O size (minimum/optimal): 4096 bytes / 4096 bytes  

- 유닛 : 현재 하드디스크의 1섹터(물리적 디스크 최소단위)의 사이즈는 512바이트다.  
- 섹터 사이즈 : 클러스터돼어있어 논리적인 섹터는 512바이트지만 실제 I/O처리에서 OS가 처리할 수 있는 용량은 4KB이다. 디스크 컨트롤러는 섹터단위처리지만 OS입장에서 효율이 좋은상황이다.  

2. 파티션 생성  
parted 명령어로 파티션 관련 명령을 할 수 있는 내부 명령창으로 이동하게 됩니다.
파티션 생성을 잘못했을 시 ``print``로 파티션정보를 확인가능하고 ``rm 파티션번호``로 삭제할 수 있다.
parted 명령어는 fdisk 명령어와 다르게 설정 즉시 설정 정보가 디스크에 바로 적용됩니다.  
``parted /dev/sda``로 해당 디스크의 파티션 작업을 하기위한 명령어를 입력합니다.  
3. 디스크를 gpt형식으로 변환  
디스크 라벨을 생성합니다.  
``(parted) mklabel gpt``
4. 논리적단위 지정, 파티션 생성  
파티션만 생성하고 파일시스템을 생성하지는 않는 단계입니다.
``unit GB`` , ``mkpart primary 0GB 2000GB`` ``mkpart primary 2000GB 4001GB``  
이 방식으로 진행할 수도 있고 ``parted``를 사용하지 않는 방식으로
``fdisk /dev/sda`` ,``n``으로 파티션을 만들수도 있습니다. 이 방식은 파티션 생성 후 ``w``로 디스크에 실제 쓰는 명령까지 해줘야합니다.
![](../../../static/img/20200502-odroid-ubuntu/make-partition.JPG)  
5. 포맷 진행
파일시스템을 생성하지 않으면 마운트할 수 없다.
``mkfs.ext3 /dev/sda1``
![](../../../static/img/20200502-odroid-ubuntu/mkfs.JPG)  
6. 파티션 정보 보기
``lsblk -o NAME,FSTYPE,LABEL,SIZE,MOUNTPOINT``
7. 마운트하기
``mount /dev/sda1 /mnt/hdd1``
재부팅할때마다 자동 마운트하려면 /etc/fstab 파일을 수정한다.
 uuid 를 확인하기 위해 ``blkid`` 명령어를 입력합니다.
 - /etc/fstab
 ```
 UUID=4704772a-099f-4bfe-89df-7bbfac0a709f /mnt/hdd1 ext4 defaults 0 0
 ```
 설정파일을 수정하고
 ``mount -a``로 설정파일의 정보를 마운트시킨다.
``df -h``로 마운트된 정보를 확인한다.
``/etc/fstab`` 파일 등 파일들이 read-only 상태로 수정이 불가능한 경우 read-write로 리마운팅 명령어 ``mount -o remount,rw /dev/sda1 /`` 로 해결가능하다.

# 참고
<https://wikidocs.net/16272>  
<https://askubuntu.com/questions/1029040/how-to-manually-mount-a-partition>  
<https://www.howtogeek.com/443342/how-to-use-the-mkfs-command-on-linux/>  
