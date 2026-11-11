import Foundation
import Security

// Recebe a credencial exclusivamente pela entrada padrão; nunca a imprime.
struct Request: Decodable { let conta: String; let token: String }
let service = "br.com.fluxo.instagram.token"
do {
    let request = try JSONDecoder().decode(Request.self, from: FileHandle.standardInput.readDataToEndOfFile())
    guard !request.conta.isEmpty, !request.token.isEmpty, let data = request.token.data(using: .utf8) else { exit(2) }
    let query: [String: Any] = [kSecClass as String: kSecClassGenericPassword,
                                kSecAttrService as String: service,
                                kSecAttrAccount as String: request.conta]
    let update: [String: Any] = [kSecValueData as String: data]
    var status = SecItemUpdate(query as CFDictionary, update as CFDictionary)
    if status == errSecItemNotFound {
        var item = query
        item[kSecValueData as String] = data
        status = SecItemAdd(item as CFDictionary, nil)
    }
    if status != errSecSuccess {
        FileHandle.standardError.write(Data("Não foi possível salvar no Chaves do macOS (código \(status)).\n".utf8))
        exit(1)
    }
    print("ok")
} catch {
    FileHandle.standardError.write(Data("Não foi possível processar a credencial.\n".utf8))
    exit(2)
}
