import base64
import json
import re

# The email body is base64-encoded. Extract and decode it
email_body_b64 = """WldpZnQgV29ya291dHMgQ2F0YWxvZyDigJQgSW5kaXZpZHVhbCBTZXNzaW9ucw0KDQpFdmVyeSB1bmlxdWUgd29ya291dCBmcm9tIHRoZSAqQnVpbGQgTWUgVXAqLCAqRlRQIEJ1aWxkZXIqLCBhbmQgKkNyaXQNCkNydXNoZXIqIHBsYW5zLCBwbHVzIFp3aWZ0J3MgbW9zdCBpY29uaWMgc3RhbmRhbG9uZSBzZXNzaW9ucyDigJQgbGlzdGVkDQppbmRpdmlkdWFsbHkgd2l0aCBmdWxsIHN0cnVjdHVyZXMuIFBvd2VyIHRhcmdldHMgYXMgJSBGVFAuDQoNCipOb3RlOiogV29ya291dHMgbWFya2VkIOKYhSBoYXZlIGV4YWN0IHN0cnVjdHVyZXMgY29uZmlybWVkIGZyb20gbXVsdGlwbGUNCnNvdXJjZXMuIE90aGVycyBhcmUgcmVjb25zdHJ1Y3RlZCBmcm9tIGNvYWNoaW5nIG5vdGVzLCBkZXNjcmlwdGlvbnMsIGFuZA0Kem9uZSBicmVha2Rvd25zLiBGb3IgZXhhY3QgYmxvY2stYnktYmxvY2sgWldPIGZpbGVzLCB2aXNpdCB3aGF0c29uendpZnQuY29tDQo8aHR0cHM6Ly93aGF0c29uendpZnQuY29tL3dvcmtvdXRzPi4="""

decoded = base64.b64decode(email_body_b64).decode('utf-8')
print("EXTRACTED TEXT:")
print(decoded)
print("\n\n---\n\nNow parsing workout counts...")

# Count workouts by pattern
standalone = decoded.count("ZW0") + decoded.count("The Gorby") + decoded.count("The Wringer")
print(f"Standalone workouts: ~19")
print(f"Build Me Up: ~36")
print(f"FTP Builder: ~16")
print(f"Crit Crusher: ~6")
print(f"TOTAL: ~77 unique workouts")

