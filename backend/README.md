# Backend

- `src/`: API 라우터, 서비스, 데이터베이스 모듈 등 서버 사이드 코드를 배치합니다.

백엔드는 `shared/contracts` 디렉터리를 참조하여 프론트엔드와 합의한 API 스펙을 구현하고 버전을 맞춥니다.

## 개발 서버 실행하기

```bash
cd backend
npm install
npm run dev
```

기본적으로 3001 포트에서 Express 서버가 구동되며 `/api/landmarks` 엔드포인트를 제공합니다.

## `/api/landmarks`

선택한 지도 영역을 기준으로 구글 플레이스 API에서 명소 정보를 조회합니다. 프론트엔드는 지역 이름과 함께 지도 축척(줌 레벨)을 전달하면, 축척에 따라 반경을 계산하여 주변 명소를 반환합니다.

| Query | 설명 | 필수 |
| --- | --- | --- |
| `region` | 사용자에게 표시된 지역 이름 | ✅ |
| `scale` | 지도 축척 또는 줌 레벨(숫자) | ❌ |
| `latitude` | 지역 중심 위도 | ❌ |
| `longitude` | 지역 중심 경도 | ❌ |

위/경도가 전달되면 `nearbysearch` API를 사용하고, 그렇지 않은 경우 `textsearch` API를 사용해 명소를 검색합니다.

응답 예시는 아래와 같습니다.

```json
{
  "region": "Seoul",
  "scale": 12,
  "source": "google_places",
  "landmarks": [
    {
      "placeId": "...",
      "name": "Gyeongbokgung Palace",
      "formattedAddress": "161 Sajik-ro, Sejongno, Jongno-gu, Seoul, South Korea",
      "location": { "lat": 37.5796, "lng": 126.977 },
      "rating": 4.6,
      "userRatingsTotal": 92000,
      "types": ["tourist_attraction", "point_of_interest", "establishment"],
      "photoReferences": ["Aaw..."]
    }
  ]
}
```

> **참고:** 실 서비스에서는 `GOOGLE_MAPS_API_KEY` 환경변수에 실제 키를 주입해야 합니다. 현재 레포지토리에는 임시 키(`DUMMY_GOOGLE_MAPS_API_KEY`)가 기본값으로 설정되어 있습니다.
