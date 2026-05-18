export const CURL_EXAMPLE = `curl https://api.kairoscheck.net/v1/verify \\\n  -H "Authorization: Bearer sk_live_..." \\\n  -H "Content-Type: application/json" \\\n  -d '{"type":"email","value":"user@example.com"}'\n\n# Response:\n{\n  "score": 12,\n  "risk": "safe",\n  "signals": ["valid_mx", "not_disposable", "clean_domain"],\n  "latency_ms": 34\n}`;

export const CODE_EXAMPLES = {
  bash: CURL_EXAMPLE,

  node: `import Kairos from "@kairos/node";

const kairos = new Kairos({ apiKey: process.env.KAIROS_API_KEY });

const result = await kairos.verify({
  type:  "email",
  value: "user@example.com",
});

console.log(result.score);   // 12
console.log(result.risk);    // "safe"
console.log(result.signals); // ["valid_mx", ...]`,

  python: `import kairos

client = kairos.Client(api_key=os.environ["KAIROS_API_KEY"])

result = client.verify(
    type="email",
    value="user@example.com",
)

print(result.score)   # 12
print(result.risk)    # "safe"
print(result.signals) # ["valid_mx", ...]`,

  php: `<?php
$kairos = new \\Kairos\\Client(apiKey: getenv('KAIROS_API_KEY'));

$result = $kairos->verify([
    'type'  => 'email',
    'value' => 'user@example.com',
]);

echo $result->score;   // 12
echo $result->risk;    // "safe"`,
};
